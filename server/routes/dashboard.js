import { Router } from "express";
import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";
import { requireAuth } from "../auth.js";

const router = Router();
router.use(requireAuth);

const round = (n) => Math.round(n * 100) / 100;

router.get("/", async (req, res) => {
  const invoices = await Invoice.find({ owner: req.user._id }).populate("client", "name company");
  const sums = { paid: 0, outstanding: 0, overdue: 0, draft: 0 };
  const counts = { paid: 0, sent: 0, overdue: 0, draft: 0 };

  // Income of the last 6 months (by the date each invoice was paid)
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en", { month: "short" }), total: 0 });
  }

  for (const inv of invoices) {
    const { total } = inv.totals();
    const status = inv.displayStatus();
    counts[status] += 1;
    if (status === "paid") {
      sums.paid += total;
      const p = inv.paidAt || inv.updatedAt;
      const m = months.find((x) => x.key === `${p.getFullYear()}-${p.getMonth()}`);
      if (m) m.total += total;
    } else if (status === "draft") sums.draft += total;
    else {
      sums.outstanding += total;
      if (status === "overdue") sums.overdue += total;
    }
  }

  const attention = invoices
    .filter((i) => ["overdue", "sent"].includes(i.displayStatus()))
    .sort((a, b) => a.dueDate - b.dueDate)
    .slice(0, 5)
    .map((i) => i.toPublic());

  res.json({
    currency: req.user.business.currency,
    totals: Object.fromEntries(Object.entries(sums).map(([k, v]) => [k, round(v)])),
    counts,
    clients: await Client.countDocuments({ owner: req.user._id }),
    invoices: invoices.length,
    monthly: months.map(({ label, total }) => ({ label, total: round(total) })),
    attention,
  });
});

export default router;

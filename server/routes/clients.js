import { Router } from "express";
import mongoose from "mongoose";
import Client from "../models/Client.js";
import Invoice from "../models/Invoice.js";
import { expiryOf, requireAuth } from "../auth.js";

const router = Router();
router.use(requireAuth);

const FIELDS = ["name", "email", "company", "phone", "address"];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, String(body[f]).trim()]));
const validId = (id) => mongoose.isValidObjectId(id);

router.get("/", async (req, res) => {
  const clients = await Client.find({ owner: req.user._id }).sort({ name: 1 }).lean();
  // Add each client's number of invoices and total billed
  const invoices = await Invoice.find({ owner: req.user._id });
  const stats = {};
  for (const inv of invoices) {
    const s = (stats[inv.client] ??= { invoices: 0, billed: 0 });
    s.invoices += 1;
    s.billed += inv.totals().total;
  }
  res.json(clients.map((c) => ({ ...c, invoices: stats[c._id]?.invoices || 0, billed: Math.round((stats[c._id]?.billed || 0) * 100) / 100 })));
});

router.post("/", async (req, res) => {
  const data = pick(req.body);
  if (!data.name) return res.status(400).json({ error: "Please enter the client's name." });
  const client = await Client.create({ ...data, owner: req.user._id, expiresAt: expiryOf(req) });
  res.status(201).json(client);
});

router.put("/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ error: "Client not found." });
  const data = pick(req.body);
  if (data.name === "") return res.status(400).json({ error: "Please enter the client's name." });
  const client = await Client.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, data, { new: true, runValidators: true });
  if (!client) return res.status(404).json({ error: "Client not found." });
  res.json(client);
});

router.delete("/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ error: "Client not found." });
  const used = await Invoice.countDocuments({ owner: req.user._id, client: req.params.id });
  if (used) return res.status(409).json({ error: `This client has ${used} invoice${used > 1 ? "s" : ""}. Delete those first.` });
  const gone = await Client.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!gone) return res.status(404).json({ error: "Client not found." });
  res.json({ ok: true });
});

export default router;

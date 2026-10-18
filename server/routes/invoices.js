import { Router } from "express";
import mongoose from "mongoose";
import Client from "../models/Client.js";
import Invoice from "../models/Invoice.js";
import { expiryOf, requireAuth } from "../auth.js";

const router = Router();
router.use(requireAuth);

const validId = (id) => mongoose.isValidObjectId(id);
const num = (v) => (v === "" || v === null || v === undefined ? NaN : Number(v));

// Checks and cleans the invoice form. Returns [data, error].
async function readInvoice(req) {
  const b = req.body;
  if (!validId(b.client) || !(await Client.exists({ _id: b.client, owner: req.user._id }))) return [null, "Please choose a client."];
  const number = String(b.number || "").trim();
  if (!number) return [null, "Please enter an invoice number."];
  const issueDate = new Date(b.issueDate), dueDate = new Date(b.dueDate);
  if (isNaN(issueDate) || isNaN(dueDate)) return [null, "Please enter the issue date and due date."];
  if (dueDate < issueDate) return [null, "The due date can't be before the issue date."];
  const items = (Array.isArray(b.items) ? b.items : [])
    .map((i) => ({ description: String(i.description || "").trim(), quantity: num(i.quantity), price: num(i.price) }))
    .filter((i) => i.description || !isNaN(i.quantity) || !isNaN(i.price));
  if (!items.length) return [null, "Add at least one item."];
  for (const [n, i] of items.entries()) {
    if (!i.description) return [null, `Item ${n + 1} needs a description.`];
    if (!(i.quantity >= 0) || !(i.price >= 0)) return [null, `Item ${n + 1} needs a quantity and price of 0 or more.`];
  }
  const taxRate = num(b.taxRate || 0), discount = num(b.discount || 0);
  if (!(taxRate >= 0 && taxRate <= 100)) return [null, "Tax must be between 0 and 100%."];
  if (!(discount >= 0)) return [null, "The discount can't be negative."];
  const status = ["draft", "sent", "paid"].includes(b.status) ? b.status : "draft";
  return [{ client: b.client, number, issueDate, dueDate, items, taxRate, discount, status, notes: String(b.notes || "").trim() }, null];
}

router.get("/", async (req, res) => {
  const invoices = await Invoice.find({ owner: req.user._id }).sort({ issueDate: -1, number: -1 }).populate("client", "name company email");
  res.json(invoices.map((i) => i.toPublic()));
});

// Suggests the next invoice number, e.g. INV-1011
router.get("/next-number", async (req, res) => {
  const all = await Invoice.find({ owner: req.user._id }, "number").lean();
  const max = all.reduce((m, i) => Math.max(m, parseInt(String(i.number).replace(/\D/g, ""), 10) || 0), 1000);
  res.json({ number: `INV-${max + 1}` });
});

router.get("/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ error: "Invoice not found." });
  const inv = await Invoice.findOne({ _id: req.params.id, owner: req.user._id }).populate("client");
  if (!inv) return res.status(404).json({ error: "Invoice not found." });
  res.json(inv.toPublic());
});

router.post("/", async (req, res) => {
  const [data, error] = await readInvoice(req);
  if (error) return res.status(400).json({ error });
  if (await Invoice.exists({ owner: req.user._id, number: data.number })) return res.status(409).json({ error: `Invoice number ${data.number} is already used.` });
  const inv = await Invoice.create({ ...data, paidAt: data.status === "paid" ? new Date() : null, owner: req.user._id, expiresAt: expiryOf(req) });
  res.status(201).json(inv.toPublic());
});

router.put("/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ error: "Invoice not found." });
  const inv = await Invoice.findOne({ _id: req.params.id, owner: req.user._id });
  if (!inv) return res.status(404).json({ error: "Invoice not found." });
  const [data, error] = await readInvoice(req);
  if (error) return res.status(400).json({ error });
  if (data.number !== inv.number && (await Invoice.exists({ owner: req.user._id, number: data.number }))) {
    return res.status(409).json({ error: `Invoice number ${data.number} is already used.` });
  }
  if (data.status === "paid" && inv.status !== "paid") inv.paidAt = new Date();
  if (data.status !== "paid") inv.paidAt = null;
  Object.assign(inv, data);
  await inv.save();
  res.json(inv.toPublic());
});

// Quick status change from the list: { status: "sent" | "paid" | "draft" }
router.patch("/:id/status", async (req, res) => {
  if (!validId(req.params.id) || !["draft", "sent", "paid"].includes(req.body.status)) return res.status(400).json({ error: "Invalid status." });
  const inv = await Invoice.findOne({ _id: req.params.id, owner: req.user._id }).populate("client", "name company email");
  if (!inv) return res.status(404).json({ error: "Invoice not found." });
  inv.status = req.body.status;
  inv.paidAt = inv.status === "paid" ? inv.paidAt || new Date() : null;
  await inv.save();
  res.json(inv.toPublic());
});

router.delete("/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ error: "Invoice not found." });
  const gone = await Invoice.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!gone) return res.status(404).json({ error: "Invoice not found." });
  res.json({ ok: true });
});

export default router;

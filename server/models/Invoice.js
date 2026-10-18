import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 200 },
    quantity: { type: Number, required: true, min: 0, max: 100000 },
    price: { type: Number, required: true, min: 0, max: 10000000 },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    number: { type: String, required: true, trim: true, maxlength: 30 },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    items: { type: [itemSchema], validate: [(v) => v.length > 0 && v.length <= 50, "Add between 1 and 50 items."] },
    taxRate: { type: Number, min: 0, max: 100, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    // "overdue" isn't stored: it's worked out from status "sent" + a due date in the past
    status: { type: String, enum: ["draft", "sent", "paid"], default: "draft" },
    paidAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

invoiceSchema.index({ owner: 1, number: 1 }, { unique: true });
invoiceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const round = (n) => Math.round(n * 100) / 100;

invoiceSchema.methods.totals = function () {
  const subtotal = round(this.items.reduce((s, i) => s + i.quantity * i.price, 0));
  const discount = round(Math.min(this.discount || 0, subtotal));
  const tax = round(((subtotal - discount) * (this.taxRate || 0)) / 100);
  return { subtotal, discount, tax, total: round(subtotal - discount + tax) };
};

invoiceSchema.methods.displayStatus = function () {
  if (this.status === "sent" && this.dueDate < new Date(new Date().toDateString())) return "overdue";
  return this.status;
};

invoiceSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.owner;
  delete obj.expiresAt;
  return { ...obj, ...this.totals(), displayStatus: this.displayStatus() };
};

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

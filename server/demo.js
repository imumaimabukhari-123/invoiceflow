// Creates a fresh demo account with sample clients and invoices.
// Each visitor gets their own copy, and MongoDB deletes it after 24 hours.
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Client from "./models/Client.js";
import Invoice from "./models/Invoice.js";

const day = 24 * 60 * 60 * 1000;
const daysFromToday = (n) => {
  const d = new Date(new Date().toDateString());
  return new Date(d.getTime() + n * day);
};

const CLIENTS = [
  { name: "Sarah Johnson", company: "Bloom & Co. Florist", email: "sarah@bloomco.example", phone: "+1 555 0142", address: "12 Garden Street, Portland, OR" },
  { name: "Ahmed Khan", company: "Khan Logistics", email: "ahmed@khanlogistics.example", phone: "+44 20 7946 0958", address: "88 Dock Road, London" },
  { name: "Maria Lopez", company: "Lopez Studio", email: "maria@lopezstudio.example", phone: "+34 91 555 0199", address: "Calle Mayor 5, Madrid" },
  { name: "David Chen", company: "Peak Fitness", email: "david@peakfitness.example", phone: "+1 555 0187", address: "400 Summit Ave, Denver, CO" },
];

// [client index, days since issue, status, items, taxRate, discount]
const INVOICES = [
  [0, 150, "paid", [["Shopify store setup", 1, 450], ["Product upload (40 products)", 40, 2.5]], 0, 0],
  [1, 120, "paid", [["Website redesign", 1, 900], ["Logo refresh", 1, 150]], 10, 50],
  [2, 95, "paid", [["Monthly SEO maintenance", 3, 120]], 0, 0],
  [3, 70, "paid", [["Booking system integration", 1, 600], ["Staff training session (hours)", 4, 35]], 5, 0],
  [0, 50, "paid", [["AI product descriptions", 60, 3], ["Image alt text", 60, 1]], 0, 20],
  [1, 38, "sent", [["Shipping tracker dashboard", 1, 750]], 10, 0],
  [2, 20, "paid", [["Monthly SEO maintenance", 3, 120], ["Blog posts", 4, 45]], 0, 0],
  [3, 12, "sent", [["Mobile app landing page", 1, 380], ["Copywriting", 1, 90]], 5, 0],
  [0, 5, "sent", [["Holiday campaign pages", 3, 140]], 0, 0],
  [2, 1, "draft", [["Chatbot for customer support", 1, 520]], 0, 0],
];

export async function createDemoAccount() {
  const expiresAt = new Date(Date.now() + day);
  const user = await User.create({
    name: "Demo User",
    email: `demo-${crypto.randomBytes(6).toString("hex")}@demo.invoiceflow`,
    passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 8),
    business: { name: "Your Business Studio", address: "1 Market Street, Your City", currency: "USD" },
    expiresAt,
  });
  const clients = await Client.insertMany(CLIENTS.map((c) => ({ ...c, owner: user._id, expiresAt })));
  await Invoice.insertMany(
    INVOICES.map(([ci, ago, status, items, taxRate, discount], i) => {
      const issueDate = daysFromToday(-ago);
      return {
        owner: user._id, client: clients[ci]._id, number: `INV-${String(1001 + i)}`,
        issueDate, dueDate: new Date(issueDate.getTime() + 14 * day),
        items: items.map(([description, quantity, price]) => ({ description, quantity, price })),
        taxRate, discount, status, paidAt: status === "paid" ? new Date(issueDate.getTime() + 9 * day) : null,
        notes: "Thank you for your business! Payment by bank transfer within 14 days.", expiresAt,
      };
    }),
  );
  return user;
}

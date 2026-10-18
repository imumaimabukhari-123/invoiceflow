import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAuth, signToken } from "../auth.js";
import { createDemoAccount } from "../demo.js";

const router = Router();
// Slows down password guessing and demo-account spam
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again." } });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "INR", "AED", "CAD", "AUD"];

router.post("/register", limiter, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!name) return res.status(400).json({ error: "Please enter your name." });
  if (!EMAIL.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (password.length < 8) return res.status(400).json({ error: "Your password needs at least 8 characters." });
  if (await User.exists({ email })) return res.status(409).json({ error: "An account with this email already exists. Try logging in." });
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), business: { name } });
  res.status(201).json({ token: signToken(user), user: user.toPublic() });
});

router.post("/login", limiter, async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email, expiresAt: null });
  const ok = user && (await bcrypt.compare(String(req.body.password || ""), user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Wrong email or password." });
  res.json({ token: signToken(user), user: user.toPublic() });
});

router.post("/demo", limiter, async (_req, res) => {
  const user = await createDemoAccount();
  res.status(201).json({ token: signToken(user), user: user.toPublic() });
});

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user.toPublic() }));

router.put("/me", requireAuth, async (req, res) => {
  const { name, business = {} } = req.body;
  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ error: "Please enter your name." });
    req.user.name = String(name).trim();
  }
  if (business.name !== undefined) req.user.business.name = String(business.name).trim();
  if (business.address !== undefined) req.user.business.address = String(business.address).trim();
  if (business.currency !== undefined) {
    if (!CURRENCIES.includes(business.currency)) return res.status(400).json({ error: "Please choose a currency from the list." });
    req.user.business.currency = business.currency;
  }
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

export default router;

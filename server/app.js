// The Express API. Used by server/dev.js on your computer and by api/index.js on Vercel.
import "dotenv/config";
import express from "express";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import invoiceRoutes from "./routes/invoices.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
app.set("trust proxy", 1); // Vercel sits in front of the app; needed for per-visitor rate limits
app.use(express.json({ limit: "100kb" }));

app.use("/api", async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: "The database isn't reachable right now. Please try again in a minute." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

// Any error a route throws ends up here, so the server never crashes on bad input
app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "The request wasn't valid JSON." });
  if (err.name === "ValidationError" || err.name === "CastError") return res.status(400).json({ error: "Some of the information isn't valid. Please check the form." });
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side. Please try again." });
});

export default app;

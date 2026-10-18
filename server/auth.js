// Login tokens (JWT) and the middleware that protects the API.
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing. Add it to the .env file.");
  return process.env.JWT_SECRET;
};

export const signToken = (user) => jwt.sign({ sub: String(user._id) }, secret(), { expiresIn: user.expiresAt ? "1d" : "7d" });

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Please log in." });
  try {
    const { sub } = jwt.verify(token, secret());
    const user = await User.findById(sub);
    if (!user) return res.status(401).json({ error: "Your session has ended. Please log in again." });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Your session has ended. Please log in again." });
  }
}

// Demo data disappears with the demo account, so records copy its expiry date.
export const expiryOf = (req) => req.user.expiresAt || null;

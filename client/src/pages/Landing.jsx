import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const FEATURES = [
  ["🧾", "Professional invoices", "Line items, tax and discounts, worked out for you. Download a clean PDF in one click."],
  ["📊", "Dashboard", "See what's paid, what's outstanding and what's overdue, plus your income over the last 6 months."],
  ["⏰", "Overdue alerts", "Invoices past their due date are flagged automatically, so nothing slips through."],
  ["👥", "Client list", "Keep every client's details in one place and see how much you've billed each one."],
  ["🔒", "Secure accounts", "Encrypted passwords and private data: each account only ever sees its own invoices."],
  ["📱", "Works everywhere", "Use it on your laptop or your phone. Nothing to install."],
];

export default function Landing() {
  const { user, demo } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const tryDemo = async () => {
    setBusy(true);
    setError("");
    try {
      await demo();
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="landing">
      <header className="land-nav">
        <Link to="/" className="logo"><img src="/icon.svg" alt="" />InvoiceFlow</Link>
        <nav>
          <a href="#features">Features</a>
          <Link to="/guide">Guide</Link>
          <a href="#developer">Developer</a>
          {user ? <Link className="btn primary" to="/dashboard">Open dashboard</Link> : <Link className="btn" to="/login">Log in</Link>}
        </nav>
      </header>

      <section className="hero">
        <div>
          <span className="pill">Free · MERN stack · Live demo</span>
          <h1>Invoices and clients,<br /><span>made simple.</span></h1>
          <p>Create professional invoices in a minute, track who has paid, and see your income at a glance. Built for freelancers and small businesses.</p>
          <div className="cta">
            <button className="btn primary big" onClick={tryDemo} disabled={busy}>{busy ? "Opening the demo…" : "▶ Try the demo, no sign-up"}</button>
            <Link className="btn big" to="/register">Create a free account</Link>
          </div>
          <p className="muted small" style={{ margin: "10px 0 0" }}>New here? Read the <Link to="/guide">step-by-step guide</Link>.</p>
          {error && <div className="error-box" style={{ marginTop: 14 }}>{error}</div>}
          <small className="muted">The demo opens a private sample account with clients and invoices. It's deleted after 24 hours.</small>
        </div>
        <img className="hero-shot" src="/preview.png" width="1280" height="800" alt="The InvoiceFlow dashboard with income totals, a monthly income chart and invoices that need attention" />
      </section>

      <section id="features" className="section">
        <h2>Everything you need to get paid</h2>
        <div className="feature-grid">
          {FEATURES.map(([icon, title, text]) => (
            <div key={title} className="card feature"><div className="f-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Built with the MERN stack</h2>
        <div className="chips">
          <span className="chip"><b>MongoDB</b> + Mongoose</span>
          <span className="chip"><b>Express</b> REST API</span>
          <span className="chip"><b>React</b> + React Router</span>
          <span className="chip"><b>Node.js</b></span>
          <span className="chip"><b>JWT</b> login + bcrypt</span>
          <span className="chip"><b>jsPDF</b> invoices</span>
          <span className="chip"><b>Vercel</b> + MongoDB Atlas</span>
        </div>
      </section>

      <section id="developer" className="section">
        <h2>Developer</h2>
        <div className="card dev-card">
          <div className="avatar big">SU</div>
          <div>
            <h3>Syeda Umaima</h3>
            <p className="muted">Software engineer · MERN web apps, AI tools, Shopify stores and Chrome extensions</p>
            <p>I build full-stack web apps like this one: dashboards, booking systems, invoicing, admin panels. Need one for your business? I can build it for you.</p>
            <div className="cta">
              <a className="btn primary" href="https://www.fiverr.com/umaima886" target="_blank" rel="noopener">Hire me on Fiverr</a>
              <a className="btn" href="mailto:imumaimabukhari@gmail.com?subject=Web%20app%20project">✉ Email me</a>
              <a className="btn" href="https://github.com/imumaimabukhari-123" target="_blank" rel="noopener">GitHub</a>
            </div>
            <ul className="contact">
              <li>✉️ Email: <a href="mailto:imumaimabukhari@gmail.com">imumaimabukhari@gmail.com</a></li>
              <li>💼 Fiverr: <a href="https://www.fiverr.com/umaima886" target="_blank" rel="noopener">fiverr.com/umaima886</a></li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="land-foot">
        © 2026 Syeda Umaima · InvoiceFlow · <a href="mailto:imumaimabukhari@gmail.com">imumaimabukhari@gmail.com</a> ·{" "}
        <a href="https://www.fiverr.com/umaima886" target="_blank" rel="noopener">Fiverr</a>
      </footer>
    </div>
  );
}

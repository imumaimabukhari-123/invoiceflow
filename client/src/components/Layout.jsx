import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const NAV = [
  ["/dashboard", "📊", "Dashboard"],
  ["/invoices", "🧾", "Invoices"],
  ["/clients", "👥", "Clients"],
  ["/settings", "⚙️", "Settings"],
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link to="/dashboard" className="logo" onClick={() => setOpen(false)}><img src="/icon.svg" alt="" />InvoiceFlow</Link>
        <nav>
          {NAV.map(([to, icon, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}><span>{icon}</span>{label}</NavLink>
          ))}
        </nav>
        <Link to="/invoices/new" className="btn primary block" onClick={() => setOpen(false)}>+ New invoice</Link>
        <div className="sidebar-user">
          <div className="avatar">{(user.name || "?").slice(0, 1).toUpperCase()}</div>
          <div className="who"><b>{user.name}</b><small>{user.isDemo ? "Demo account" : user.email}</small></div>
          <button className="link" onClick={() => { logout(); navigate("/"); }}>Log out</button>
        </div>
      </aside>
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <Link to="/dashboard" className="logo small"><img src="/icon.svg" alt="" />InvoiceFlow</Link>
        </header>
        {user.isDemo && (
          <div className="demo-banner">
            👋 You're in a <b>demo account</b> with sample data. Try anything; it's deleted after 24 hours.{" "}
            <Link to="/register" onClick={logout}>Create your own free account →</Link>
          </div>
        )}
        <main className="content">{children}</main>
        <footer className="app-foot">
          InvoiceFlow by Syeda Umaima · <a href="mailto:imumaimabukhari@gmail.com">imumaimabukhari@gmail.com</a> ·{" "}
          <a href="https://www.fiverr.com/umaima886" target="_blank" rel="noopener">Hire me on Fiverr</a>
        </footer>
      </div>
    </div>
  );
}

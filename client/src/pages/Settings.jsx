import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { ErrorBox } from "../components/ui.jsx";

const CURRENCIES = [["USD", "US Dollar ($)"], ["EUR", "Euro (€)"], ["GBP", "British Pound (£)"], ["PKR", "Pakistani Rupee (Rs)"],
  ["INR", "Indian Rupee (₹)"], ["AED", "UAE Dirham"], ["CAD", "Canadian Dollar"], ["AUD", "Australian Dollar"]];

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, businessName: user.business.name, address: user.business.address, currency: user.business.currency });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(""); setError("");
    try {
      const d = await api("/auth/me", { method: "PUT", body: { name: form.name, business: { name: form.businessName, address: form.address, currency: form.currency } } });
      setUser(d.user);
      setMsg("Saved ✓");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Settings</h1><p className="muted">These details appear on every invoice.</p></div></div>
      <form className="card form-card narrow stack" onSubmit={save}>
        <ErrorBox>{error}</ErrorBox>
        <label>Your name<input value={form.name} onChange={set("name")} required maxLength={80} /></label>
        <label>Business name<input value={form.businessName} onChange={set("businessName")} maxLength={120} placeholder="e.g. Umaima Studio" /></label>
        <label>Business address<textarea rows="3" value={form.address} onChange={set("address")} maxLength={300} placeholder="Street, city, country" /></label>
        <label>Currency
          <select value={form.currency} onChange={set("currency")}>{CURRENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <div className="form-actions"><span className="ok">{msg}</span><button className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button></div>
        <p className="muted small">Signed in as {user.isDemo ? "a demo account" : user.email}.</p>
      </form>
    </>
  );
}

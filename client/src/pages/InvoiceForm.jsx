import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { addDays, inputDate, itemTotals, money } from "../format.js";
import { ErrorBox, Loading } from "../components/ui.jsx";

const emptyItem = () => ({ description: "", quantity: 1, price: "" });

export default function InvoiceForm() {
  const { id } = useParams();
  const editing = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cl = await api("/clients");
        setClients(cl);
        if (editing) {
          const inv = await api(`/invoices/${id}`);
          setForm({ ...inv, client: inv.client._id, issueDate: inputDate(inv.issueDate), dueDate: inputDate(inv.dueDate) });
        } else {
          const { number } = await api("/invoices/next-number");
          const today = inputDate();
          setForm({ client: cl[0]?._id || "", number, issueDate: today, dueDate: addDays(today, 14), items: [emptyItem()], taxRate: 0, discount: 0, notes: "Thank you for your business!", status: "draft" });
        }
      } catch (e) { setError(e.message); }
    })();
  }, [id, editing]);

  if (!form || !clients) return error ? <ErrorBox>{error}</ErrorBox> : <Loading />;

  const cur = user.business.currency;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setItem = (n, k, v) => setForm({ ...form, items: form.items.map((it, i) => (i === n ? { ...it, [k]: v } : it)) });
  const t = itemTotals(form.items, form.taxRate, form.discount);

  const save = async (status) => {
    setSaving(true);
    setError("");
    try {
      const body = { ...form, status: status || form.status };
      const inv = await api(editing ? `/invoices/${id}` : "/invoices", { method: editing ? "PUT" : "POST", body });
      navigate(`/invoices/${inv._id}`);
    } catch (e) {
      setError(e.message);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!clients.length) {
    return (
      <div className="card empty">
        <div className="empty-icon">👥</div><h3>Add a client first</h3>
        <p>Every invoice is for a client. Add one, then come back here.</p>
        <Link className="btn primary" to="/clients?new=1">Add a client</Link>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }}>
      <div className="page-head">
        <div><h1>{editing ? `Edit ${form.number}` : "New invoice"}</h1><p className="muted">Totals update as you type.</p></div>
      </div>
      <ErrorBox>{error}</ErrorBox>

      <div className="card form-card">
        <div className="form-grid">
          <label>Client
            <select value={form.client} onChange={set("client")}>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
            </select>
            <small><Link to="/clients?new=1">+ Add a new client</Link></small>
          </label>
          <label>Invoice number<input value={form.number} onChange={set("number")} maxLength={30} required /></label>
          <label>Issue date<input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value, dueDate: form.dueDate < e.target.value ? addDays(e.target.value, 14) : form.dueDate })} required /></label>
          <label>Due date<input type="date" value={form.dueDate} min={form.issueDate} onChange={set("dueDate")} required /></label>
        </div>

        <h3 className="section-title">Items</h3>
        <div className="items">
          <div className="item-row head"><span>Description</span><span>Qty</span><span>Price</span><span className="num">Amount</span><span /></div>
          {form.items.map((it, n) => (
            <div className="item-row" key={n}>
              <input placeholder="e.g. Website design" value={it.description} onChange={(e) => setItem(n, "description", e.target.value)} maxLength={200} aria-label={`Item ${n + 1} description`} />
              <input type="number" min="0" step="any" value={it.quantity} onChange={(e) => setItem(n, "quantity", e.target.value)} aria-label={`Item ${n + 1} quantity`} />
              <input type="number" min="0" step="0.01" placeholder="0.00" value={it.price} onChange={(e) => setItem(n, "price", e.target.value)} aria-label={`Item ${n + 1} price`} />
              <span className="num amount">{money((Number(it.quantity) || 0) * (Number(it.price) || 0), cur)}</span>
              <button type="button" className="x" disabled={form.items.length === 1} onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== n) })} aria-label="Remove item">×</button>
            </div>
          ))}
          <button type="button" className="btn tiny" onClick={() => setForm({ ...form, items: [...form.items, emptyItem()] })}>+ Add item</button>
        </div>

        <div className="totals-area">
          <label className="notes">Notes (shown on the invoice)<textarea rows="4" value={form.notes} onChange={set("notes")} maxLength={1000} /></label>
          <div className="totals">
            <div><span>Subtotal</span><b>{money(t.subtotal, cur)}</b></div>
            <div><span>Discount ({cur})</span><input type="number" min="0" step="0.01" value={form.discount} onChange={set("discount")} /></div>
            <div><span>Tax (%)</span><input type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={set("taxRate")} /></div>
            {t.tax > 0 && <div className="muted"><span>Tax amount</span><span>{money(t.tax, cur)}</span></div>}
            <div className="grand"><span>Total</span><b>{money(t.total, cur)}</b></div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <Link className="btn" to={editing ? `/invoices/${id}` : "/invoices"}>Cancel</Link>
        {editing ? (
          <button className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        ) : (
          <>
            <button type="button" className="btn" disabled={saving} onClick={() => save("draft")}>Save as draft</button>
            <button type="button" className="btn primary" disabled={saving} onClick={() => save("sent")}>{saving ? "Saving…" : "Save & mark as sent"}</button>
          </>
        )}
      </div>
    </form>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { date, money } from "../format.js";
import { ErrorBox, Loading, StatusBadge } from "../components/ui.jsx";

export default function InvoiceView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inv, setInv] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { api(`/invoices/${id}`).then(setInv).catch((e) => setError(e.message)); }, [id]);

  if (!inv) return error ? <><ErrorBox>{error}</ErrorBox><Link to="/invoices">← Back to invoices</Link></> : <Loading />;
  const cur = user.business.currency;
  const c = inv.client || {};

  const setStatus = async (status) => {
    try { setInv(await api(`/invoices/${id}/status`, { method: "PATCH", body: { status } })); }
    catch (e) { setError(e.message); }
  };
  // The PDF library is big, so it's only loaded when someone downloads a PDF
  const download = async () => {
    try { (await import("../pdf.js")).downloadInvoicePdf(inv, user); }
    catch { setError("Couldn't create the PDF. Please try again."); }
  };
  const remove = async () => {
    if (!window.confirm(`Delete invoice ${inv.number}? This can't be undone.`)) return;
    try { await api(`/invoices/${id}`, { method: "DELETE" }); navigate("/invoices"); }
    catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="page-head">
        <div><Link to="/invoices" className="back">← Invoices</Link><h1>{inv.number} <StatusBadge status={inv.displayStatus} /></h1></div>
        <div className="actions">
          <button className="btn primary" onClick={download}>⬇ Download PDF</button>
          {inv.status === "draft" && <button className="btn" onClick={() => setStatus("sent")}>Mark as sent</button>}
          {inv.status === "sent" && <button className="btn" onClick={() => setStatus("paid")}>✓ Mark as paid</button>}
          {inv.status === "paid" && <button className="btn" onClick={() => setStatus("sent")}>Mark as unpaid</button>}
          <Link className="btn" to={`/invoices/${id}/edit`}>Edit</Link>
          <button className="btn danger" onClick={remove}>Delete</button>
        </div>
      </div>
      <ErrorBox>{error}</ErrorBox>
      {inv.displayStatus === "overdue" && <div className="warn-box">⏰ This invoice was due on {date(inv.dueDate)} and hasn't been paid yet.</div>}

      <div className="paper">
        <div className="paper-head">
          <div><h2>{user.business.name || user.name}</h2><p className="muted pre">{user.business.address}</p></div>
          <div className="right"><div className="inv-title">INVOICE</div>
            <dl><dt>Invoice no.</dt><dd>{inv.number}</dd><dt>Issue date</dt><dd>{date(inv.issueDate)}</dd><dt>Due date</dt><dd>{date(inv.dueDate)}</dd>
              {inv.paidAt && <><dt>Paid on</dt><dd>{date(inv.paidAt)}</dd></>}</dl>
          </div>
        </div>
        <div className="bill-to"><small>BILL TO</small><b>{c.name}</b>{[c.company, c.email, c.phone, c.address].filter(Boolean).map((l) => <span key={l}>{l}</span>)}</div>
        <table className="table paper-table">
          <thead><tr><th>Description</th><th className="num">Qty</th><th className="num">Price</th><th className="num">Amount</th></tr></thead>
          <tbody>{inv.items.map((i, n) => <tr key={n}><td>{i.description}</td><td className="num">{i.quantity}</td><td className="num">{money(i.price, cur)}</td><td className="num">{money(i.quantity * i.price, cur)}</td></tr>)}</tbody>
        </table>
        <div className="paper-totals">
          <div><span>Subtotal</span><span>{money(inv.subtotal, cur)}</span></div>
          {inv.discount > 0 && <div><span>Discount</span><span>-{money(inv.discount, cur)}</span></div>}
          {inv.taxRate > 0 && <div><span>Tax ({inv.taxRate}%)</span><span>{money(inv.tax, cur)}</span></div>}
          <div className="grand"><span>Total</span><span>{money(inv.total, cur)}</span></div>
        </div>
        {inv.notes && <div className="paper-notes"><small>NOTES</small><p className="pre">{inv.notes}</p></div>}
      </div>
    </>
  );
}

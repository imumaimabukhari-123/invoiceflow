import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { date, money } from "../format.js";
import { Empty, ErrorBox, Loading, StatusBadge } from "../components/ui.jsx";

const TABS = [["all", "All"], ["draft", "Drafts"], ["sent", "Sent"], ["overdue", "Overdue"], ["paid", "Paid"]];

export default function Invoices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { api("/invoices").then(setList).catch((e) => setError(e.message)); }, []);

  const counts = useMemo(() => {
    const c = { all: list?.length || 0 };
    (list || []).forEach((i) => (c[i.displayStatus] = (c[i.displayStatus] || 0) + 1));
    return c;
  }, [list]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (list || []).filter((i) => (tab === "all" || i.displayStatus === tab) &&
      (!s || [i.number, i.client?.name, i.client?.company].some((v) => (v || "").toLowerCase().includes(s))));
  }, [list, tab, q]);

  const markPaid = async (inv, e) => {
    e.stopPropagation();
    try {
      const updated = await api(`/invoices/${inv._id}/status`, { method: "PATCH", body: { status: "paid" } });
      setList(list.map((i) => (i._id === inv._id ? updated : i)));
    } catch (err) { setError(err.message); }
  };

  if (!list) return error ? <ErrorBox>{error}</ErrorBox> : <Loading />;
  const cur = user.business.currency;

  return (
    <>
      <div className="page-head">
        <div><h1>Invoices</h1><p className="muted">{list.length} invoice{list.length === 1 ? "" : "s"}</p></div>
        <Link to="/invoices/new" className="btn primary">+ New invoice</Link>
      </div>
      <ErrorBox>{error}</ErrorBox>

      {list.length === 0 ? (
        <Empty icon="🧾" title="No invoices yet" text="Create your first invoice and it will show up here." action={<Link className="btn primary" to="/invoices/new">Create an invoice</Link>} />
      ) : (
        <div className="card table-card">
          <div className="toolbar">
            <div className="tabs">
              {TABS.map(([k, label]) => (
                <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{label} <span>{counts[k] || 0}</span></button>
              ))}
            </div>
            <input className="search" placeholder="Search number or client…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {shown.length === 0 ? <p className="muted pad">No invoices match.</p> : (
            <table className="table">
              <thead><tr><th>Invoice</th><th>Client</th><th className="hide-sm">Issued</th><th className="hide-sm">Due</th><th className="num">Amount</th><th>Status</th><th /></tr></thead>
              <tbody>
                {shown.map((i) => (
                  <tr key={i._id} onClick={() => navigate(`/invoices/${i._id}`)}>
                    <td><b>{i.number}</b></td>
                    <td>{i.client?.name}<small className="muted block">{i.client?.company}</small></td>
                    <td className="hide-sm">{date(i.issueDate)}</td>
                    <td className="hide-sm">{date(i.dueDate)}</td>
                    <td className="num"><b>{money(i.total, cur)}</b></td>
                    <td><StatusBadge status={i.displayStatus} /></td>
                    <td className="num">{["sent", "overdue"].includes(i.displayStatus) && <button className="btn tiny" onClick={(e) => markPaid(i, e)}>Mark paid</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}

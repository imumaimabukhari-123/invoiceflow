import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { date, money } from "../format.js";
import { Empty, ErrorBox, Loading, StatusBadge } from "../components/ui.jsx";

function IncomeChart({ months, currency }) {
  const max = Math.max(...months.map((m) => m.total), 1);
  return (
    <div className="chart" role="img" aria-label="Income for the last 6 months">
      {months.map((m) => (
        <div key={m.label} className="bar-col" title={`${m.label}: ${money(m.total, currency)}`}>
          <span className="bar-value">{m.total ? money(m.total, currency).replace(/\.00$/, "") : ""}</span>
          <div className="bar" style={{ height: `${Math.max((m.total / max) * 100, m.total ? 4 : 1)}%` }} />
          <span className="bar-label">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { api("/dashboard").then(setData).catch((e) => setError(e.message)); }, []);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data) return <Loading />;
  const cur = data.currency;
  const hello = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="page-head">
        <div><h1>{hello}, {user.name.split(" ")[0]} 👋</h1><p className="muted">Here's how your business is doing.</p></div>
        <Link to="/invoices/new" className="btn primary">+ New invoice</Link>
      </div>

      {data.invoices === 0 ? (
        <Empty icon="🧾" title="No invoices yet" text="Add a client, then create your first invoice. It takes about a minute."
          action={<div className="cta center"><Link className="btn" to="/clients">Add a client</Link><Link className="btn primary" to="/invoices/new">Create an invoice</Link></div>} />
      ) : (
        <>
          <div className="stats">
            <div className="stat green"><span>Paid</span><b>{money(data.totals.paid, cur)}</b><small>{data.counts.paid} invoices</small></div>
            <div className="stat blue"><span>Outstanding</span><b>{money(data.totals.outstanding, cur)}</b><small>{data.counts.sent + data.counts.overdue} waiting for payment</small></div>
            <div className="stat red"><span>Overdue</span><b>{money(data.totals.overdue, cur)}</b><small>{data.counts.overdue} past the due date</small></div>
            <div className="stat grey"><span>Drafts</span><b>{money(data.totals.draft, cur)}</b><small>{data.counts.draft} not sent yet</small></div>
          </div>

          <div className="dash-grid">
            <div className="card">
              <h2>Income, last 6 months</h2>
              <IncomeChart months={data.monthly} currency={cur} />
            </div>
            <div className="card">
              <h2>Needs attention</h2>
              {data.attention.length === 0 ? <p className="muted">🎉 Nothing waiting. Every sent invoice is paid.</p> : (
                <ul className="attention">
                  {data.attention.map((i) => (
                    <li key={i._id}>
                      <Link to={`/invoices/${i._id}`}>
                        <div><b>{i.client?.name}</b><small>{i.number} · due {date(i.dueDate)}</small></div>
                        <div className="right"><b>{money(i.total, cur)}</b><StatusBadge status={i.displayStatus} /></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="card-foot"><Link to="/invoices">All invoices →</Link> · {data.clients} clients</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

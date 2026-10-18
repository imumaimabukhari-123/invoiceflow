import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { money } from "../format.js";
import { Empty, ErrorBox, Loading, Modal } from "../components/ui.jsx";

const BLANK = { name: "", company: "", email: "", phone: "", address: "" };

export default function Clients() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(params.get("new") ? { ...BLANK } : null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api("/clients").then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const close = () => { setEditing(null); setFormError(""); if (params.get("new")) setParams({}); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const body = Object.fromEntries(Object.keys(BLANK).map((k) => [k, editing[k] || ""]));
      await api(editing._id ? `/clients/${editing._id}` : "/clients", { method: editing._id ? "PUT" : "POST", body });
      close();
      load();
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.name}?`)) return;
    try { await api(`/clients/${c._id}`, { method: "DELETE" }); load(); }
    catch (err) { setError(err.message); }
  };

  if (!list) return error ? <ErrorBox>{error}</ErrorBox> : <Loading />;
  const field = (k, label, type = "text", extra = {}) => (
    <label>{label}<input type={type} value={editing[k] || ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} {...extra} /></label>
  );

  return (
    <>
      <div className="page-head">
        <div><h1>Clients</h1><p className="muted">{list.length} client{list.length === 1 ? "" : "s"}</p></div>
        <button className="btn primary" onClick={() => setEditing({ ...BLANK })}>+ Add client</button>
      </div>
      <ErrorBox>{error}</ErrorBox>

      {list.length === 0 ? (
        <Empty icon="👥" title="No clients yet" text="Add the people and businesses you work for." action={<button className="btn primary" onClick={() => setEditing({ ...BLANK })}>Add your first client</button>} />
      ) : (
        <div className="client-grid">
          {list.map((c) => (
            <div key={c._id} className="card client">
              <div className="client-top">
                <div className="avatar">{c.name.slice(0, 1).toUpperCase()}</div>
                <div><b>{c.name}</b><small className="muted block">{c.company || "–"}</small></div>
              </div>
              <ul className="client-info">
                {c.email && <li>✉️ <a href={`mailto:${c.email}`}>{c.email}</a></li>}
                {c.phone && <li>📞 {c.phone}</li>}
                {c.address && <li>📍 {c.address}</li>}
              </ul>
              <div className="client-stats"><span><b>{c.invoices}</b> invoices</span><span><b>{money(c.billed, user.business.currency)}</b> billed</span></div>
              <div className="client-actions">
                <button className="btn tiny" onClick={() => setEditing({ ...c })}>Edit</button>
                <button className="btn tiny danger" onClick={() => remove(c)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? "Edit client" : "Add a client"} onClose={close}>
          <form onSubmit={save} className="stack">
            <ErrorBox>{formError}</ErrorBox>
            {field("name", "Name *", "text", { required: true, maxLength: 120, autoFocus: true })}
            {field("company", "Company", "text", { maxLength: 120 })}
            {field("email", "Email", "email", { maxLength: 120 })}
            {field("phone", "Phone", "tel", { maxLength: 40 })}
            {field("address", "Address", "text", { maxLength: 300 })}
            <div className="form-actions"><button type="button" className="btn" onClick={close}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save client"}</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { ErrorBox } from "../components/ui.jsx";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register, demo } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || "/dashboard";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run(() => (isLogin ? login(form.email, form.password) : register(form.name, form.email, form.password)));
  };

  return (
    <div className="auth-page">
      <Link to="/" className="logo"><img src="/icon.svg" alt="" />InvoiceFlow</Link>
      <form className="card auth-card" onSubmit={submit}>
        <h1>{isLogin ? "Welcome back" : "Create your free account"}</h1>
        <p className="muted">{isLogin ? "Log in to manage your invoices." : "Start sending professional invoices in a minute."}</p>
        <ErrorBox>{error}</ErrorBox>
        {!isLogin && (
          <label>Your name<input value={form.name} onChange={set("name")} autoComplete="name" required maxLength={80} /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" required /></label>
        <label>Password
          <input type="password" value={form.password} onChange={set("password")} autoComplete={isLogin ? "current-password" : "new-password"} required minLength={isLogin ? 1 : 8} />
          {!isLogin && <small className="muted">At least 8 characters.</small>}
        </label>
        <button className="btn primary block" disabled={busy}>{busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}</button>
        <div className="or"><span>or</span></div>
        <button type="button" className="btn block" disabled={busy} onClick={() => run(demo)}>▶ Try the demo, no sign-up</button>
        <p className="switch">
          {isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already have an account? <Link to="/login">Log in</Link></>}
        </p>
      </form>
    </div>
  );
}

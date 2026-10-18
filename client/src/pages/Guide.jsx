import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const TOC = [
  ["start", "Getting started"],
  ["clients", "Adding clients"],
  ["invoice", "Creating an invoice"],
  ["status", "Sending and getting paid"],
  ["pdf", "Downloading a PDF"],
  ["dashboard", "Reading the dashboard"],
  ["settings", "Your business details"],
  ["problems", "Fixing problems"],
  ["faq", "FAQ"],
];

function Step({ n, title, children }) {
  return (
    <div className="g-step">
      <div className="g-n">{n}</div>
      <div><h3>{title}</h3>{children}</div>
    </div>
  );
}

export default function Guide() {
  const { user } = useAuth();
  return (
    <div className="landing guide">
      <header className="land-nav">
        <Link to="/" className="logo"><img src="/icon.svg" alt="" />InvoiceFlow</Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/guide" className="active-link">Guide</Link>
          {user ? <Link className="btn primary" to="/dashboard">Open dashboard</Link> : <Link className="btn" to="/login">Log in</Link>}
        </nav>
      </header>

      <div className="g-wrap">
        <header className="g-intro">
          <h1>How to use InvoiceFlow</h1>
          <p className="muted">A step-by-step guide for beginners. You'll send your first invoice in about 5 minutes.</p>
        </header>

        <nav className="card g-toc" aria-label="On this page">
          <b>On this page</b>
          <ol>{TOC.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
        </nav>

        <section id="start">
          <h2>1. Getting started</h2>
          <Step n="1" title="Try it first (optional)">
            <p>On the <Link to="/">home page</Link>, click <b>Try the demo, no sign-up</b>. You get your own sample account with 4 clients and 10 invoices to play with. It's deleted automatically after 24 hours.</p>
          </Step>
          <Step n="2" title="Create your free account">
            <p>Click <b>Create a free account</b>, type your name, email and a password (at least 8 characters), then click <b>Create account</b>. You're taken straight to your dashboard.</p>
          </Step>
          <Step n="3" title="Log in next time">
            <p>Click <b>Log in</b> at the top of the home page and use the same email and password. You stay logged in for 7 days on that browser.</p>
          </Step>
          <div className="g-tip">💡 Set your business name, address and currency first in <b>Settings</b>. They're printed on every invoice. See <a href="#settings">step 7</a>.</div>
        </section>

        <section id="clients">
          <h2>2. Adding clients</h2>
          <p>Every invoice is for a client, so add your clients first.</p>
          <ol>
            <li>Click <b>Clients</b> in the left menu (on a phone, tap <b>☰</b> first).</li>
            <li>Click <b>+ Add client</b>.</li>
            <li>Type the <b>name</b> (required). Company, email, phone and address are optional but appear on the invoice.</li>
            <li>Click <b>Save client</b>.</li>
          </ol>
          <p>Each client card shows how many invoices they have and how much you've billed them. Use <b>Edit</b> to change details. <b>Delete</b> only works for clients with no invoices, so you can't lose invoices by mistake.</p>
        </section>

        <section id="invoice">
          <h2>3. Creating an invoice</h2>
          <Step n="1" title="Start a new invoice">
            <p>Click <b>+ New invoice</b> (in the left menu or on the dashboard).</p>
          </Step>
          <Step n="2" title="Choose the client and dates">
            <p>Pick the <b>client</b>. The <b>invoice number</b> is filled in for you (e.g. INV-1011) and you can change it. The <b>due date</b> is set to 14 days after the issue date. Change it if you agreed something else.</p>
          </Step>
          <Step n="3" title="Add what you're charging for">
            <p>For each line, type a <b>description</b>, the <b>quantity</b> and the <b>price</b>. Click <b>+ Add item</b> for more lines, or <b>×</b> to remove one. The amount for each line is worked out for you.</p>
          </Step>
          <Step n="4" title="Discount, tax and notes">
            <p>Enter a <b>discount</b> (an amount in your currency) and <b>tax</b> (a percentage) if you need them. The <b>total</b> updates as you type. Add <b>notes</b> such as payment instructions. They're printed at the bottom of the invoice.</p>
          </Step>
          <Step n="5" title="Save">
            <p>Click <b>Save as draft</b> if you're not ready to send it, or <b>Save &amp; mark as sent</b> if you're sending it to the client now.</p>
          </Step>
          <div className="g-example card">
            <b>Example:</b> Shopify store setup, 1 × $450 = $450, plus Product uploads, 20 × $3.50 = $70.<br />
            Subtotal $520, discount −$20, tax 10% +$50 → <b>Total $550</b>.
          </div>
        </section>

        <section id="status">
          <h2>4. Sending and getting paid</h2>
          <table className="g-table">
            <thead><tr><th>Status</th><th>What it means</th><th>How it changes</th></tr></thead>
            <tbody>
              <tr><td><span className="badge draft">Draft</span></td><td>Not sent to the client yet.</td><td>Open the invoice and click <b>Mark as sent</b>.</td></tr>
              <tr><td><span className="badge sent">Sent</span></td><td>Sent and waiting for payment.</td><td>When you're paid, click <b>✓ Mark as paid</b>.</td></tr>
              <tr><td><span className="badge overdue">Overdue</span></td><td>Sent, but the due date has passed.</td><td>Happens automatically. Remind the client, then mark it as paid when they pay.</td></tr>
              <tr><td><span className="badge paid">Paid</span></td><td>Money received.</td><td>Paid by mistake? Click <b>Mark as unpaid</b>.</td></tr>
            </tbody>
          </table>
          <p>On the <b>Invoices</b> page, use the tabs (<b>Drafts, Sent, Overdue, Paid</b>) and the search box to find invoices quickly. Sent and overdue invoices have a <b>Mark paid</b> button right in the list.</p>
          <div className="g-tip">✉️ InvoiceFlow doesn't email clients for you. Download the PDF and send it yourself by email or WhatsApp, then click <b>Mark as sent</b>.</div>
        </section>

        <section id="pdf">
          <h2>5. Downloading a PDF</h2>
          <ol>
            <li>Open the invoice (click it in the <b>Invoices</b> list).</li>
            <li>Click <b>⬇ Download PDF</b>. The file is saved as e.g. <code>INV-1011.pdf</code> in your Downloads folder.</li>
            <li>Attach it to an email or message to your client.</li>
          </ol>
          <p>The PDF shows your business details, the client, every item, the discount, tax and total, the due date and your notes.</p>
        </section>

        <section id="dashboard">
          <h2>6. Reading the dashboard</h2>
          <ul>
            <li><b>Paid:</b> money you've received.</li>
            <li><b>Outstanding:</b> sent invoices you're still waiting for (including overdue ones).</li>
            <li><b>Overdue:</b> the part of outstanding that's past its due date. Chase these first!</li>
            <li><b>Drafts:</b> invoices you haven't sent yet.</li>
            <li><b>Income, last 6 months:</b> how much you were paid each month.</li>
            <li><b>Needs attention:</b> the sent and overdue invoices with the nearest due dates.</li>
          </ul>
        </section>

        <section id="settings">
          <h2>7. Your business details</h2>
          <p>Click <b>Settings</b> in the left menu to set your <b>name</b>, <b>business name</b>, <b>business address</b> and <b>currency</b> (USD, EUR, GBP, PKR, INR, AED, CAD or AUD), then click <b>Save settings</b>. These appear on every invoice and PDF, including old ones.</p>
        </section>

        <section id="problems">
          <h2>8. Fixing problems</h2>
          <table className="g-table">
            <thead><tr><th>You see…</th><th>What to do</th></tr></thead>
            <tbody>
              <tr><td>"Wrong email or password."</td><td>Check for typos and Caps Lock. Demo accounts can't log in again; just open a new demo.</td></tr>
              <tr><td>"An account with this email already exists."</td><td>Click <b>Log in</b> instead.</td></tr>
              <tr><td>"Invoice number … is already used."</td><td>Every invoice needs its own number. Change it, e.g. to the next number.</td></tr>
              <tr><td>"The due date can't be before the issue date."</td><td>Pick a due date on or after the issue date.</td></tr>
              <tr><td>"This client has … invoices. Delete those first."</td><td>This protects your invoices. Delete the client's invoices first if you really want to remove them.</td></tr>
              <tr><td>"Your session has ended. Please log in again."</td><td>For your security you're logged out after 7 days (demo: 1 day). Log in again.</td></tr>
              <tr><td>"Too many attempts…"</td><td>Wait a few minutes before trying to log in again.</td></tr>
              <tr><td>The page looks old or broken</td><td>Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> to reload.</td></tr>
            </tbody>
          </table>
        </section>

        <section id="faq">
          <h2>9. FAQ</h2>
          <details className="card g-faq"><summary>Is it free?</summary><p>Yes, this demo app is free to use.</p></details>
          <details className="card g-faq"><summary>Is my data private?</summary><p>Yes. Passwords are encrypted and every account only ever sees its own clients and invoices.</p></details>
          <details className="card g-faq"><summary>Does it work on my phone?</summary><p>Yes. Tap <b>☰</b> at the top left to open the menu.</p></details>
          <details className="card g-faq"><summary>What happens to the demo account?</summary><p>It's private to you and deleted automatically after 24 hours. Create a free account to keep your data.</p></details>
          <details className="card g-faq"><summary>Can I get a custom app like this for my business?</summary><p>Yes: with your branding, online payments, email reminders, staff accounts and more. See the <Link to="/#developer">Developer</Link> section.</p></details>
        </section>

        <div className="g-end">
          {user ? <Link className="btn primary big" to="/dashboard">Open my dashboard</Link> : <Link className="btn primary big" to="/register">Create a free account</Link>}
          <Link className="btn big" to="/">Back to home</Link>
        </div>
      </div>

      <footer className="land-foot">
        © 2026 Syeda Umaima · InvoiceFlow · <a href="mailto:imumaimabukhari@gmail.com">imumaimabukhari@gmail.com</a> ·{" "}
        <a href="https://www.fiverr.com/umaima886" target="_blank" rel="noopener">Fiverr</a>
      </footer>
    </div>
  );
}

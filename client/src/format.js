export function money(n, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n || 0);
  } catch {
    return `${currency} ${(n || 0).toFixed(2)}`;
  }
}

export const date = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "–");

// "2026-10-18" for <input type="date">
export const inputDate = (d) => {
  const x = d ? new Date(d) : new Date();
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const addDays = (iso, n) => inputDate(new Date(new Date(iso).getTime() + n * 86400000));

export const STATUS_LABEL = { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue" };

export function itemTotals(items, taxRate, discount) {
  const r = (n) => Math.round(n * 100) / 100;
  const subtotal = r(items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0));
  const disc = r(Math.min(Number(discount) || 0, subtotal));
  const tax = r(((subtotal - disc) * (Number(taxRate) || 0)) / 100);
  return { subtotal, discount: disc, tax, total: r(subtotal - disc + tax) };
}

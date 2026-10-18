// Small helper for calling the Express API with the login token.
const TOKEN_KEY = "invoiceflow-token";

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
};

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let resp;
  try {
    resp = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Couldn't reach the server. Check your internet connection.");
  }
  const data = await resp.json().catch(() => ({}));
  if (resp.status === 401 && token) {
    setToken(null);
    window.dispatchEvent(new Event("invoiceflow-logout"));
  }
  if (!resp.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api("/auth/me").then((d) => setUser(d.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("invoiceflow-logout", onLogout);
    return () => window.removeEventListener("invoiceflow-logout", onLogout);
  }, []);

  const signIn = useCallback(async (path, body) => {
    const d = await api(path, { method: "POST", body });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const value = {
    user, loading, setUser,
    login: (email, password) => signIn("/auth/login", { email, password }),
    register: (name, email, password) => signIn("/auth/register", { name, email, password }),
    demo: () => signIn("/auth/demo"),
    logout: () => { setToken(null); setUser(null); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

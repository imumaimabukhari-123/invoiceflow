import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Invoices from "./pages/Invoices.jsx";
import InvoiceForm from "./pages/InvoiceForm.jsx";
import InvoiceView from "./pages/InvoiceView.jsx";
import Clients from "./pages/Clients.jsx";
import Settings from "./pages/Settings.jsx";

function Private({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" />} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/invoices" element={<Private><Invoices /></Private>} />
      <Route path="/invoices/new" element={<Private><InvoiceForm /></Private>} />
      <Route path="/invoices/:id" element={<Private><InvoiceView /></Private>} />
      <Route path="/invoices/:id/edit" element={<Private><InvoiceForm /></Private>} />
      <Route path="/clients" element={<Private><Clients /></Private>} />
      <Route path="/settings" element={<Private><Settings /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

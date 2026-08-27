import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminShell from "../../components/layout/AdminShell.jsx";
import LoginPage from "../../features/auth/LoginPage.jsx";
import { useAuthStore } from "../../store/authStore.js";

function RequireAdmin({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function DashboardPlaceholder() {
  return (
    <div>
      <h1 className="h4">Dashboard</h1>
      <p className="text-secondary">Thong ke se duoc noi o pull request tiep theo.</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={(
          <RequireAdmin>
            <AdminShell />
          </RequireAdmin>
        )}
      >
        <Route index element={<DashboardPlaceholder />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

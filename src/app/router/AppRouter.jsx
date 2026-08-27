import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminShell from "../../components/layout/AdminShell.jsx";
import LoginPage from "../../features/auth/LoginPage.jsx";
import DashboardPage from "../../features/dashboard/DashboardPage.jsx";
import { useAuthStore } from "../../store/authStore.js";

function RequireAdmin({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
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
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminShell from "../../components/layout/AdminShell.jsx";
import LoginPage from "../../features/auth/LoginPage.jsx";
import DashboardPage from "../../features/dashboard/DashboardPage.jsx";
import ProductListPage from "../../features/products/ProductListPage.jsx";
import ProductCreatePage from "../../features/products/ProductCreatePage.jsx";
import ProductDetailPage from "../../features/products/ProductDetailPage.jsx";
import CategoryPage from "../../features/categories/CategoryPage.jsx";
import OrderListPage from "../../features/orders/OrderListPage.jsx";
import OrderDetailPage from "../../features/orders/OrderDetailPage.jsx";
import ReturnQueuePage from "../../features/orders/ReturnQueuePage.jsx";
import UserListPage from "../../features/users/UserListPage.jsx";
import UserDetailPage from "../../features/users/UserDetailPage.jsx";
import ReviewListPage from "../../features/reviews/ReviewListPage.jsx";
import PromotionPage from "../../features/promotions/PromotionPage.jsx";
import VoucherPage from "../../features/vouchers/VoucherPage.jsx";
import AuditLogPage from "../../features/audit/AuditLogPage.jsx";
import { useAuthStore } from "../../store/authStore.js";

function RequireAdmin({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function RequireRole({ roles, children }) {
  const role = useAuthStore((state) => state.role);
  return roles.includes(role) ? children : <Navigate to="/" replace />;
}

function HomeRoute() {
  const role = useAuthStore((state) => state.role);
  return role === "CATALOG_MANAGER" ? <Navigate to="/products" replace /> : <DashboardPage />;
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
        <Route index element={<HomeRoute />} />
        <Route path="products" element={<RequireRole roles={["ADMIN", "CATALOG_MANAGER"]}><ProductListPage /></RequireRole>} />
        <Route path="products/new" element={<RequireRole roles={["ADMIN", "CATALOG_MANAGER"]}><ProductCreatePage /></RequireRole>} />
        <Route path="products/:id" element={<RequireRole roles={["ADMIN", "CATALOG_MANAGER"]}><ProductDetailPage /></RequireRole>} />
        <Route path="categories" element={<RequireRole roles={["ADMIN", "CATALOG_MANAGER"]}><CategoryPage /></RequireRole>} />
        <Route path="orders" element={<RequireRole roles={["ADMIN", "ORDER_MANAGER", "SUPPORT"]}><OrderListPage /></RequireRole>} />
        <Route path="orders/:id" element={<RequireRole roles={["ADMIN", "ORDER_MANAGER", "SUPPORT"]}><OrderDetailPage /></RequireRole>} />
        <Route path="returns" element={<RequireRole roles={["ADMIN", "ORDER_MANAGER", "SUPPORT"]}><ReturnQueuePage /></RequireRole>} />
        <Route path="users" element={<RequireRole roles={["ADMIN", "ORDER_MANAGER", "SUPPORT"]}><UserListPage /></RequireRole>} />
        <Route path="users/:id" element={<RequireRole roles={["ADMIN", "ORDER_MANAGER", "SUPPORT"]}><UserDetailPage /></RequireRole>} />
        <Route path="reviews" element={<RequireRole roles={["ADMIN", "CATALOG_MANAGER", "SUPPORT"]}><ReviewListPage /></RequireRole>} />
        <Route path="promotions" element={<RequireRole roles={["ADMIN", "CATALOG_MANAGER"]}><PromotionPage /></RequireRole>} />
        <Route path="vouchers" element={<RequireRole roles={["ADMIN", "ORDER_MANAGER"]}><VoucherPage /></RequireRole>} />
        <Route path="audit-logs" element={<RequireRole roles={["ADMIN"]}><AuditLogPage /></RequireRole>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

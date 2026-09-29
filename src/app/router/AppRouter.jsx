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
import UserListPage from "../../features/users/UserListPage.jsx";
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
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="users" element={<UserListPage />} />
        <Route path="reviews" element={<ReviewListPage />} />
        <Route path="promotions" element={<PromotionPage />} />
        <Route path="vouchers" element={<VoucherPage />} />
        <Route path="audit-logs" element={<AuditLogPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

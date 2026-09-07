import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Star,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../../services/api/authApi.js";
import { useAuthStore } from "../../store/authStore.js";
import ToastHost from "../common/ToastHost.jsx";

const NAV = [
  { to: "/", label: "Tổng quan", end: true, icon: LayoutDashboard },
  { to: "/products", label: "Sản phẩm", icon: Package },
  { to: "/categories", label: "Danh mục", icon: FolderTree },
  { to: "/orders", label: "Đơn hàng", icon: ShoppingBag },
  { to: "/users", label: "Tài khoản", icon: Users },
  { to: "/reviews", label: "Đánh giá", icon: Star }
];

export default function AdminShell() {
  const role = useAuthStore((state) => state.role);
  const [navOpen, setNavOpen] = useState(false);

  async function onLogout() {
    await logout();
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="admin-shell">
      {navOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Đóng menu"
          onClick={closeNav}
        />
      )}
      <aside className={`admin-sidebar${navOpen ? " is-open" : ""}`}>
        <div className="admin-sidebar-logo">
          <span>LYRA <span className="admin-sidebar-tag">Admin</span></span>
          <button
            type="button"
            className="btn btn-link p-0 d-md-none"
            style={{ color: "var(--cream)" }}
            aria-label="Đóng menu"
            onClick={closeNav}
          >
            <X size={18} />
          </button>
        </div>
        <div className="admin-nav-section">Quản lý</div>
        <nav className="nav flex-column">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                onClick={closeNav}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-nav-section">Hệ thống</div>
          <button type="button" className="admin-nav-item admin-nav-exit" onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header d-flex justify-content-between align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-md-none"
            aria-label="Mở menu"
            onClick={() => setNavOpen(true)}
          >
            <Menu size={16} />
          </button>
          <div className="admin-user ms-auto">
            <div className="admin-avatar" aria-hidden="true">A</div>
            <div className="admin-user-meta">
              <strong>{role === "ADMIN" ? "Quản trị viên" : "Tài khoản"}</strong>
              <span>LyraShop</span>
            </div>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  );
}

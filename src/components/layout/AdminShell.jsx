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
        <div className="px-2 mb-4 d-flex justify-content-between align-items-start">
          <div>
            <div className="brand-mark">LYRA</div>
            <div className="brand-sub">Quản trị cửa hàng</div>
          </div>
          <button
            type="button"
            className="btn btn-link text-white p-0 d-md-none"
            aria-label="Đóng menu"
            onClick={closeNav}
          >
            <X size={18} />
          </button>
        </div>
        <nav className="nav flex-column gap-1">
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
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="admin-main d-flex flex-column">
        <header className="admin-header d-flex justify-content-between align-items-center px-3 px-md-4">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-md-none"
              aria-label="Mở menu"
              onClick={() => setNavOpen(true)}
            >
              <Menu size={16} />
            </button>
            <span className="text-secondary small">Tài khoản {role === "ADMIN" ? "quản trị viên" : "đăng nhập"}</span>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2" onClick={onLogout}>
            <LogOut size={14} aria-hidden="true" />
            Đăng xuất
          </button>
        </header>
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  );
}

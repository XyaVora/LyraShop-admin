import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Star,
  LogOut
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

  async function onLogout() {
    await logout();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="px-2 mb-4">
          <div className="brand-mark">LYRA</div>
          <div className="brand-sub">Quản trị cửa hàng</div>
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
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="admin-main d-flex flex-column">
        <header className="admin-header d-flex justify-content-between align-items-center px-4">
          <span className="text-secondary small">Tài khoản {role === "ADMIN" ? "quản trị viên" : "đăng nhập"}</span>
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

import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../../services/api/authApi.js";
import { useAuthStore } from "../../store/authStore.js";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/products", label: "San pham" },
  { to: "/categories", label: "Danh muc" },
  { to: "/orders", label: "Don hang" },
  { to: "/users", label: "Tai khoan" }
];

export default function AdminShell() {
  const subject = useAuthStore((state) => state.subject);

  async function onLogout() {
    await logout();
  }

  return (
    <div className="admin-shell min-vh-100">
      <aside className="admin-sidebar text-white p-3">
        <div className="fs-5 fw-semibold mb-4">LyraShop Admin</div>
        <nav className="nav flex-column gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link rounded px-3 py-2 ${isActive ? "active" : "text-white-50"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-header d-flex justify-content-between align-items-center px-4">
          <span className="text-secondary small">
            {subject ? `ADMIN · ${subject}` : "ADMIN"}
          </span>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
            Dang xuat
          </button>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

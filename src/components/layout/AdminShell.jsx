import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgePercent, Bell, FolderTree, LayoutDashboard, LogOut, Menu, Moon,
  Package, Search, Settings, ShoppingBag, Star, Sun, Users, X, TicketPercent, ClipboardList, RotateCcw
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../services/api/authApi.js";
import { adminApi } from "../../services/api/adminApi.js";
import { useAuthStore } from "../../store/authStore.js";
import { useUiStore } from "../../store/uiStore.js";
import { ORDER_STATUS_LABEL } from "../../utils/status.js";
import ToastHost from "../common/ToastHost.jsx";

const NAV = [
  { to: "/", label: "Tổng quan", end: true, icon: LayoutDashboard, roles: ["ADMIN", "ORDER_MANAGER", "SUPPORT"] },
  { to: "/products", label: "Sản phẩm", icon: Package, roles: ["ADMIN", "CATALOG_MANAGER"] },
  { to: "/categories", label: "Danh mục", icon: FolderTree, roles: ["ADMIN", "CATALOG_MANAGER"] },
  { to: "/orders", label: "Đơn hàng", icon: ShoppingBag, roles: ["ADMIN", "ORDER_MANAGER", "SUPPORT"] },
  { to: "/returns", label: "Trả hàng", icon: RotateCcw, roles: ["ADMIN", "ORDER_MANAGER", "SUPPORT"] },
  { to: "/users", label: "Tài khoản", icon: Users, roles: ["ADMIN", "ORDER_MANAGER", "SUPPORT"] },
  { to: "/reviews", label: "Đánh giá", icon: Star, roles: ["ADMIN", "CATALOG_MANAGER", "SUPPORT"] },
  { to: "/promotions", label: "Khuyến mãi", icon: BadgePercent, roles: ["ADMIN", "CATALOG_MANAGER"] },
  { to: "/vouchers", label: "Voucher", icon: TicketPercent, roles: ["ADMIN", "ORDER_MANAGER"] },
  { to: "/audit-logs", label: "Nhật ký", icon: ClipboardList, roles: ["ADMIN"] }
];

const ROLE_LABEL = { ADMIN: "Quản trị viên", CATALOG_MANAGER: "Quản lý catalog", ORDER_MANAGER: "Quản lý đơn hàng", SUPPORT: "Hỗ trợ khách hàng" };

export default function AdminShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const { theme, density, setTheme, setDensity } = useUiStore();
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSearchTerm(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);
  const searchActive = search.trim().length >= 2;
  const searchQuery = useQuery({
    queryKey: ["admin", "search", searchTerm],
    queryFn: () => adminApi.search(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 30_000
  });
  const notificationsQuery = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: adminApi.listNotifications,
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: role !== "CATALOG_MANAGER"
  });
  const readNotification = useMutation({
    mutationFn: adminApi.readNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] })
  });
  const readAllNotifications = useMutation({
    mutationFn: adminApi.readAllNotifications,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] })
  });

  const results = useMemo(() => {
    if (!searchActive) return [];
    const labels = { PRODUCT: "Sản phẩm", ORDER: "Đơn hàng", USER: "Tài khoản" };
    return (searchQuery.data || []).map((item) => ({
      type: labels[item.type] || item.type,
      title: item.title,
      subtitle: item.type === "ORDER"
        ? item.subtitle.replace(/ · ([A-Z_]+)$/, (_, status) => ` · ${ORDER_STATUS_LABEL[status] || status}`)
        : item.subtitle,
      to: item.path
    }));
  }, [searchActive, searchQuery.data]);

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((item) => !item.read).length;

  function go(to) {
    setSearch("");
    setNotificationsOpen(false);
    setSettingsOpen(false);
    navigate(to);
  }

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main">Đi tới nội dung chính</a>
      {navOpen && <button type="button" className="sidebar-backdrop" aria-label="Đóng menu" onClick={() => setNavOpen(false)} />}
      <aside className={`admin-sidebar${navOpen ? " is-open" : ""}`}>
        <div className="admin-sidebar-logo">
          <span>LYRA <span className="admin-sidebar-tag">Admin</span></span>
          <button type="button" className="btn btn-link p-0 d-md-none" aria-label="Đóng menu" onClick={() => setNavOpen(false)}><X size={18} /></button>
        </div>
        <div className="admin-nav-section">Quản lý</div>
        <nav className="nav flex-column">
          {NAV.filter((item) => !item.roles || item.roles.includes(role)).map((item) => {
            const Icon = item.icon;
            return <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} onClick={() => { setNavOpen(false); setSearch(""); setNotificationsOpen(false); setSettingsOpen(false); }}><Icon size={16} />{item.label}</NavLink>;
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-nav-section px-2 pb-1">Hệ thống</div>
          <div className="admin-account-card">
            <div className="d-flex align-items-center gap-2"><div className="admin-avatar">Q</div><div className="admin-user-meta"><strong>{ROLE_LABEL[role] || "Tài khoản"}</strong><span>LyraShop</span></div></div>
            <button type="button" className="btn btn-link p-1" onClick={logout} title="Đăng xuất" aria-label="Đăng xuất"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button type="button" className="btn btn-outline-secondary btn-sm d-md-none me-3" aria-label="Mở menu" onClick={() => setNavOpen(true)}><Menu size={16} /></button>
          <div className="header-search-wrap d-none d-sm-block">
            <div className="header-search-pill"><Search size={15} /><input value={search} onChange={(event) => { setSearch(event.target.value); setNotificationsOpen(false); setSettingsOpen(false); }} onKeyDown={(event) => { if (event.key === "Enter" && results[0]) go(results[0].to); }} type="search" placeholder="Tìm sản phẩm, đơn hàng, tài khoản..." aria-label="Tìm kiếm toàn cục" /></div>
            {searchActive && (
              <div className="header-popover header-search-results">
                {(searchTerm !== search.trim() || searchQuery.isLoading) && <div className="header-popover-empty">Đang tìm kiếm...</div>}
                {searchTerm === search.trim() && !searchQuery.isLoading && results.length === 0 && <div className="header-popover-empty">Không tìm thấy kết quả.</div>}
                {results.map((result) => <button key={`${result.type}-${result.title}`} type="button" className="header-result" onClick={() => go(result.to)}><span className="header-result-type">{result.type}</span><strong>{result.title}</strong><small>{result.subtitle}</small></button>)}
              </div>
            )}
          </div>

          <div className="header-actions ms-auto">
            <div className="header-action-wrap">
              <button type="button" className="header-action-btn" aria-label="Thông báo" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setSettingsOpen(false); setSearch(""); }}><Bell size={16} />{unreadCount > 0 && <span className="header-notification-dot" />}</button>
              {notificationsOpen && <div className="header-popover header-notifications"><div className="header-popover-title">Cần xử lý <span>{unreadCount} chưa đọc</span>{unreadCount > 0 && <button type="button" className="btn btn-link btn-sm p-0 ms-2" onClick={() => readAllNotifications.mutate()}>Đọc tất cả</button>}</div>{notifications.length === 0 ? <div className="header-popover-empty">Không có đơn cần xử lý.</div> : notifications.map((item) => <button key={item.key} type="button" className={`header-result${item.read ? " opacity-75" : ""}`} onClick={() => { if (!item.read) readNotification.mutate(item.key); go(item.path); }}><span className="header-result-type">{item.type === "RETURN_REQUEST" ? "Yêu cầu trả hàng" : "Đơn hàng"}</span><strong>{item.title}</strong><small>{item.message}</small></button>)}</div>}
            </div>

            <div className="header-action-wrap">
              <button type="button" className="header-action-btn" aria-label="Cài đặt" aria-expanded={settingsOpen} onClick={() => { setSettingsOpen((open) => !open); setNotificationsOpen(false); setSearch(""); }}><Settings size={16} /></button>
              {settingsOpen && <div className="header-popover header-settings"><div className="header-popover-title">Cài đặt hiển thị</div><label>Giao diện</label><div className="settings-choice"><button type="button" className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}><Sun size={14} /> Sáng</button><button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}><Moon size={14} /> Tối</button></div><label>Mật độ</label><div className="settings-choice"><button type="button" className={density === "comfortable" ? "active" : ""} onClick={() => setDensity("comfortable")}>Thoáng</button><button type="button" className={density === "compact" ? "active" : ""} onClick={() => setDensity("compact")}>Gọn</button></div></div>}
            </div>

            <button type="button" className="header-theme-toggle" aria-label={`Chuyển sang giao diện ${theme === "light" ? "tối" : "sáng"}`} onClick={() => setTheme(theme === "light" ? "dark" : "light")}><span className="header-theme-knob" />{theme === "light" ? <Sun size={13} /> : <Moon size={13} />}</button>
            <div className="admin-user ms-2 d-none d-md-flex"><div className="admin-avatar">Q</div><div className="admin-user-meta"><strong>{ROLE_LABEL[role] || "Nhân viên"}</strong></div></div>
          </div>
        </header>
        <main id="admin-main" className="admin-content" tabIndex="-1"><Outlet /></main>
      </div>
      <ToastHost />
    </div>
  );
}

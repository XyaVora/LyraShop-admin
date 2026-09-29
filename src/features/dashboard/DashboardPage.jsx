import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { openOrderCount, orderPipeline, formatPercent } from "../../utils/dashboard.js";
import { chartPoints, dashboardAnalytics } from "../../utils/dashboardAnalytics.js";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import { ORDER_STATUS_LABEL, orderStatusClass } from "../../utils/status.js";

function trendMeta(change) {
  if (change == null) {
    return { Icon: Minus, label: "Chưa có dữ liệu kỳ trước", className: "is-neutral" };
  }
  const positive = change >= 0;
  return {
    Icon: positive ? TrendingUp : TrendingDown,
    label: `${positive ? "+" : ""}${formatPercent(change)} so với 30 ngày trước`,
    className: positive ? "is-positive" : "is-negative"
  };
}

function shortDate(date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["admin", "dashboard"], queryFn: adminApi.dashboard });
  const ordersQuery = useQuery({ queryKey: ["admin", "orders"], queryFn: adminApi.listOrders });
  const data = query.data;
  const orders = ordersQuery.data || [];
  const analytics = useMemo(() => dashboardAnalytics(orders), [orders]);
  const recentOrders = orders.slice(0, 3);
  const pipeline = data ? orderPipeline(data.orders) : [];
  const maxSold = Math.max(...(data?.bestSellers || []).map((row) => row.quantitySold || 1), 1);
  const points = chartPoints(analytics.series);
  const linePath = points.map((point, index) => `${index ? "L" : "M"} ${45 + point.x} ${20 + point.y}`).join(" ");
  const areaPath = points.length ? `${linePath} L 525 180 L 45 180 Z` : "";
  const seriesMax = Math.max(...analytics.series.map((item) => item.revenue), 0);
  const dateTicks = [0, 6, 12, 18, 24, 29];
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  }).format(new Date());
  const cards = [
    { label: "Doanh thu 30 ngày", value: formatMoney(analytics.current.revenue), change: analytics.changes.revenue },
    { label: "Đơn thanh toán 30 ngày", value: analytics.current.paidCount.toLocaleString("vi-VN"), change: analytics.changes.paidCount },
    { label: "Giá trị đơn trung bình", value: formatMoney(analytics.current.averagePaidOrder), change: analytics.changes.averagePaidOrder },
    { label: "Tỷ lệ hoàn tất 30 ngày", value: formatPercent(analytics.current.completionRate), change: analytics.changes.completionRate }
  ];

  return (
    <div>
      <div className="cozy-welcome-header">
        <h1 className="cozy-welcome-title">Tổng quan</h1>
        <p className="cozy-welcome-sub">Chào mừng trở lại, Quản trị viên • {today.charAt(0).toUpperCase() + today.slice(1)}</p>
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {ordersQuery.isError && <ErrorAlert error={ordersQuery.error} />}

      {query.isLoading || ordersQuery.isLoading ? <SkeletonBlock rows={6} /> : data ? (
        <>
          <div className="cozy-stats-row">
            {cards.map((card) => {
              const trend = trendMeta(card.change);
              const TrendIcon = trend.Icon;
              return (
                <div className="cozy-metric-card" key={card.label}>
                  <div><div className="cozy-metric-label">{card.label}</div><div className="cozy-metric-value">{card.value}</div></div>
                  <div className={`cozy-metric-trend ${trend.className}`}><TrendIcon size={14} /><span>{trend.label}</span></div>
                </div>
              );
            })}
          </div>

          <div className="cozy-main-grid">
            <div className="cozy-card d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div><h2 className="cozy-section-title">Xu hướng doanh thu</h2><p className="admin-page-sub mb-0">30 ngày gần nhất, tính từ các đơn có trạng thái thanh toán PAID.</p></div>
                <span className="cozy-chart-legend"><i /> Doanh thu</span>
              </div>
              <div className="cozy-chart-wrap">
                <svg viewBox="0 0 550 215" aria-label="Biểu đồ doanh thu 30 ngày">
                  <defs><linearGradient id="lyraWarmGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--warm)" stopOpacity="0.42" /><stop offset="100%" stopColor="var(--warm)" stopOpacity="0" /></linearGradient></defs>
                  {[20, 100, 180].map((y) => <line key={y} x1="45" y1={y} x2="525" y2={y} className="cozy-chart-grid" />)}
                  <text x="39" y="24" className="cozy-chart-label" textAnchor="end">{formatMoney(seriesMax)}</text>
                  <text x="39" y="104" className="cozy-chart-label" textAnchor="end">{formatMoney(seriesMax / 2)}</text>
                  <text x="39" y="184" className="cozy-chart-label" textAnchor="end">0 ₫</text>
                  {areaPath && <path d={areaPath} fill="url(#lyraWarmGrad)" />}
                  {linePath && <path d={linePath} className="cozy-chart-line" />}
                  {dateTicks.map((index) => <text key={index} x={45 + points[index].x} y="207" className="cozy-chart-label" textAnchor="middle">{index === 29 ? "Hôm nay" : shortDate(points[index].date)}</text>)}
                </svg>
              </div>
            </div>

            <div className="cozy-right-stack">
              <div className="cozy-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="cozy-section-title">Đơn hàng gần đây</h3>
                  <button type="button" className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1" onClick={() => navigate("/orders")}>Xem tất cả <ArrowRight size={13} /></button>
                </div>
                {recentOrders.length === 0 ? <p className="admin-page-sub mb-0">Chưa có đơn hàng.</p> : <div className="d-flex flex-column gap-2">{recentOrders.map((order) => (
                  <button key={order.id} type="button" className="cozy-list-button" onClick={() => navigate(`/orders/${order.id}`)}>
                    <span className="d-flex align-items-center gap-2"><StatusBadge className={orderStatusClass(order.status)} label={ORDER_STATUS_LABEL[order.status] || order.status} /><span className="text-start"><strong>#{order.id.slice(0, 8).toUpperCase()}</strong><small>{order.shippingPhone || "Khách mua hàng"}</small></span></span>
                    <span className="text-end"><strong>{formatMoney(order.totalAmount)}</strong><small>{formatDateTime(order.createdAt)}</small></span>
                  </button>
                ))}</div>}
              </div>

              <div className="cozy-card">
                <h3 className="cozy-section-title mb-3">Sản phẩm bán chạy</h3>
                {(data.bestSellers || []).length === 0 ? <p className="admin-page-sub mb-0">Chưa có dữ liệu bán hàng.</p> : <div className="d-flex flex-column gap-3">{data.bestSellers.slice(0, 4).map((row) => (
                  <button key={row.productId} type="button" className="cozy-product-button" onClick={() => navigate(`/products/${row.productId}`)}>
                    <span className="d-flex justify-content-between gap-2"><strong>{row.productName} <small>• Đã bán {row.quantitySold}</small></strong><span>{formatMoney(row.revenue)}</span></span>
                    <span className="cozy-progress-track"><span className="cozy-progress-fill" style={{ width: `${Math.round((row.quantitySold / maxSold) * 100)}%` }} /></span>
                  </button>
                ))}</div>}
              </div>
            </div>
          </div>

          <div className="cozy-card">
            <div className="d-flex justify-content-between align-items-center mb-3"><h2 className="cozy-section-title">Luồng trạng thái đơn hàng</h2><span className="admin-page-sub">Tổng {data.orders?.total ?? 0} đơn • {openOrderCount(data.orders)} đơn đang mở</span></div>
            <div className="row g-3">{pipeline.map((item) => <div className="col-md-6 col-xl-4" key={item.key}><div className="d-flex justify-content-between align-items-center mb-1"><StatusBadge className={orderStatusClass(item.key.toUpperCase())} label={item.label} /><span className="small text-secondary">{item.count} đơn · {formatPercent(item.share)}</span></div><div className="cozy-progress-track"><div className="cozy-progress-fill" style={{ width: `${Math.round(item.share * 100)}%` }} /></div></div>)}</div>
          </div>
        </>
      ) : null}
    </div>
  );
}

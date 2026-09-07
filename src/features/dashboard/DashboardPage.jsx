import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import {
  averagePaidOrder,
  cancelRate,
  formatPercent,
  openOrderCount,
  orderPipeline
} from "../../utils/dashboard.js";
import { formatMoney } from "../../utils/format.js";
import { orderStatusClass } from "../../utils/status.js";

export default function DashboardPage() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard
  });

  const data = query.data;
  const pipeline = data ? orderPipeline(data.orders) : [];
  const cards = data ? [
    { label: "Doanh thu đã thanh toán", value: formatMoney(data.revenue?.paidTotal) },
    { label: "Đơn đã thanh toán", value: data.revenue?.paidOrderCount ?? 0 },
    { label: "Giá trị đơn TB", value: formatMoney(averagePaidOrder(data.revenue)) },
    { label: "Tổng đơn", value: data.orders?.total ?? 0 },
    { label: "Đơn đang mở", value: openOrderCount(data.orders) },
    { label: "Tỷ lệ hủy", value: formatPercent(cancelRate(data.orders)) }
  ] : [];

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        crumbs={[{ label: "Tổng quan" }]}
        description="Một snapshot GET /api/v1/admin/dashboard. Giá trị đơn TB và tỷ lệ hủy tính trên máy từ JSON đó, không phải API riêng."
      />
      {query.isError && <ErrorAlert error={query.error} />}
      {query.isLoading ? (
        <SkeletonBlock rows={6} />
      ) : data ? (
        <>
          <div className="row g-3 mb-4">
            {cards.map((card) => (
              <div className="col-md-4 col-xl-2" key={card.label}>
                <div className="card stat-card h-100">
                  <div className="card-body">
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{card.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h6 mb-3">Luồng đơn hàng</h2>
              <div className="row g-3">
                {pipeline.map((item) => (
                  <div className="col-md-6 col-xl-4" key={item.key}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <StatusBadge
                        className={orderStatusClass(item.key.toUpperCase())}
                        label={item.label}
                      />
                      <span className="small text-secondary">
                        {item.count} · {formatPercent(item.share)}
                      </span>
                    </div>
                    <div className="pipeline-track" aria-hidden="true">
                      <div className="pipeline-fill" style={{ width: `${Math.round(item.share * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h2 className="h6 mb-3">Sản phẩm bán chạy</h2>
              <DataTable
                rows={data.bestSellers || []}
                rowKey={(row) => row.productId}
                onRowClick={(row) => navigate(`/products/${row.productId}`)}
                emptyTitle="Chưa có sản phẩm bán chạy"
                emptyDescription="Khi có đơn đã ghi nhận, danh sách sẽ hiện ở đây."
                columns={[
                  { key: "productName", header: "Sản phẩm" },
                  { key: "quantitySold", header: "Số lượng" },
                  {
                    key: "revenue",
                    header: "Doanh thu",
                    render: (row) => formatMoney(row.revenue)
                  }
                ]}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

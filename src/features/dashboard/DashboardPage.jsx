import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatMoney } from "../../utils/format.js";

export default function DashboardPage() {
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard
  });

  const data = query.data;
  const cards = data ? [
    { label: "Doanh thu đã thanh toán", value: formatMoney(data.revenue?.paidTotal) },
    { label: "Đơn đã thanh toán", value: data.revenue?.paidOrderCount ?? 0 },
    { label: "Tổng đơn", value: data.orders?.total ?? 0 },
    { label: "Chờ xác nhận", value: data.orders?.pending ?? 0 },
    { label: "Đang giao", value: data.orders?.shipping ?? 0 },
    { label: "Đã giao", value: data.orders?.delivered ?? 0 }
  ] : [];

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        crumbs={[{ label: "Tổng quan" }]}
        description="Số liệu lấy từ GET /api/v1/admin/dashboard."
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
          <div className="card">
            <div className="card-body">
              <h2 className="h6 mb-3">Sản phẩm bán chạy</h2>
              <DataTable
                rows={data.bestSellers || []}
                rowKey={(row) => row.productId}
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

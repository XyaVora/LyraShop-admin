import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatMoney } from "../../utils/format.js";

export default function DashboardPage() {
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard
  });

  if (query.isLoading) {
    return <LoadingState />;
  }
  if (query.isError) {
    return <ErrorAlert error={query.error} />;
  }

  const data = query.data;
  const cards = [
    { label: "Doanh thu da thanh toan", value: formatMoney(data.revenue?.paidTotal) },
    { label: "Don da thanh toan", value: data.revenue?.paidOrderCount ?? 0 },
    { label: "Tong don", value: data.orders?.total ?? 0 },
    { label: "Cho xac nhan", value: data.orders?.pending ?? 0 },
    { label: "Dang giao", value: data.orders?.shipping ?? 0 },
    { label: "Da giao", value: data.orders?.delivered ?? 0 }
  ];

  return (
    <div>
      <h1 className="h4 mb-4">Dashboard</h1>
      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div className="col-md-4 col-xl-2" key={card.label}>
            <div className="card h-100">
              <div className="card-body">
                <div className="text-secondary small">{card.label}</div>
                <div className="fs-5 fw-semibold">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-body">
          <h2 className="h6 mb-3">San pham ban chay</h2>
          <DataTable
            rows={data.bestSellers || []}
            rowKey={(row) => row.productId}
            empty="Chua co du lieu ban chay."
            columns={[
              { key: "productName", header: "San pham" },
              { key: "quantitySold", header: "So luong" },
              {
                key: "revenue",
                header: "Doanh thu",
                render: (row) => formatMoney(row.revenue)
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

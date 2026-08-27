import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";

export default function OrderListPage() {
  const query = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: adminApi.listOrders
  });

  return (
    <div>
      <h1 className="h4 mb-4">Don hang</h1>
      {query.isError && <ErrorAlert error={query.error} />}
      {query.isLoading ? <LoadingState /> : (
        <div className="card card-body">
          <DataTable
            rows={query.data || []}
            rowKey={(row) => row.id}
            columns={[
              {
                key: "id",
                header: "Ma",
                render: (row) => <Link to={`/orders/${row.id}`}>{row.id.slice(0, 8)}</Link>
              },
              {
                key: "totalAmount",
                header: "Tong",
                render: (row) => formatMoney(row.totalAmount)
              },
              { key: "status", header: "Trang thai" },
              { key: "paymentStatus", header: "Thanh toan" },
              {
                key: "createdAt",
                header: "Tao luc",
                render: (row) => formatDateTime(row.createdAt)
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}

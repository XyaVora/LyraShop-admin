import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import { filterRows } from "../../utils/filter.js";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  orderStatusClass,
  paymentStatusClass
} from "../../utils/status.js";

export default function OrderListPage() {
  const navigate = useNavigate();
  const [queryText, setQueryText] = useState("");
  const query = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: adminApi.listOrders
  });
  const rows = filterRows(query.data || [], queryText, ["id", "status", "paymentStatus", "shippingPhone"]);

  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Đơn hàng" }]}
      />
      <div className="mb-3">
        <SearchField value={queryText} onChange={setQueryText} placeholder="Tìm mã đơn, trạng thái, SĐT..." />
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {query.isLoading ? <SkeletonBlock rows={6} /> : (
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              rows={rows}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/orders/${row.id}`)}
              emptyTitle="Chưa có đơn hàng"
              columns={[
                {
                  key: "id",
                  header: "Mã",
                  render: (row) => row.id.slice(0, 8)
                },
                {
                  key: "totalAmount",
                  header: "Tổng",
                  render: (row) => formatMoney(row.totalAmount)
                },
                {
                  key: "status",
                  header: "Trạng thái",
                  render: (row) => (
                    <StatusBadge
                      className={orderStatusClass(row.status)}
                      label={ORDER_STATUS_LABEL[row.status] || row.status}
                    />
                  )
                },
                {
                  key: "paymentStatus",
                  header: "Thanh toán",
                  render: (row) => (
                    <StatusBadge
                      className={paymentStatusClass(row.paymentStatus)}
                      label={PAYMENT_STATUS_LABEL[row.paymentStatus] || row.paymentStatus}
                    />
                  )
                },
                {
                  key: "createdAt",
                  header: "Tạo lúc",
                  render: (row) => formatDateTime(row.createdAt)
                }
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

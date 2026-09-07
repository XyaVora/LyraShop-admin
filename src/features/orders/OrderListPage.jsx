import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import ExportCsvButton from "../../components/common/ExportCsvButton.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import PaginationBar from "../../components/tables/PaginationBar.jsx";
import { useListView } from "../../hooks/useListView.js";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  orderStatusClass,
  paymentStatusClass
} from "../../utils/status.js";

const SEARCH_FIELDS = ["id", "status", "paymentStatus", "shippingPhone"];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const query = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: adminApi.listOrders
  });
  const extraFilter = useCallback((row) => (
    statusFilter === "all" || row.status === statusFilter
  ), [statusFilter]);
  const list = useListView(query.data || [], {
    fields: SEARCH_FIELDS,
    defaultSortKey: "createdAt",
    defaultSortDir: "desc",
    extraFilter
  });

  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Đơn hàng" }]}
        description="API đơn không trả mã khách. Lọc và phân trang chạy trên máy từ toàn bộ danh sách."
      />
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <SearchField value={list.queryText} onChange={list.setQueryText} placeholder="Tìm mã đơn, trạng thái, SĐT..." />
        <select
          className="form-select form-select-sm list-filter"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            list.setPage(1);
          }}
          aria-label="Lọc trạng thái đơn"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <ExportCsvButton
          filename="lyra-orders.csv"
          rows={list.allRows}
          columns={[
            { header: "id", value: (row) => row.id },
            { header: "totalAmount", value: (row) => row.totalAmount },
            { header: "status", value: (row) => row.status },
            { header: "paymentStatus", value: (row) => row.paymentStatus },
            { header: "shippingPhone", value: (row) => row.shippingPhone },
            { header: "createdAt", value: (row) => row.createdAt }
          ]}
        />
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {query.isLoading ? <SkeletonBlock rows={6} /> : (
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              rows={list.rows}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/orders/${row.id}`)}
              emptyTitle="Chưa có đơn hàng"
              emptyDescription="Thử đổi bộ lọc hoặc đợi đơn mới."
              sortKey={list.sortKey}
              sortDir={list.sortDir}
              onSort={list.toggleSort}
              columns={[
                {
                  key: "id",
                  header: "Mã",
                  sortable: true,
                  render: (row) => row.id.slice(0, 8)
                },
                {
                  key: "totalAmount",
                  header: "Tổng",
                  sortable: true,
                  render: (row) => formatMoney(row.totalAmount)
                },
                {
                  key: "status",
                  header: "Trạng thái",
                  sortable: true,
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
                  sortable: true,
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
                  sortable: true,
                  render: (row) => formatDateTime(row.createdAt)
                }
              ]}
            />
            <PaginationBar
              page={list.page}
              totalPages={list.totalPages}
              total={list.total}
              pageSize={list.pageSize}
              onPageChange={list.setPage}
              onPageSizeChange={list.setPageSize}
            />
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime } from "../../utils/format.js";
import { useToastStore } from "../../store/toastStore.js";
import PaginationBar from "../../components/tables/PaginationBar.jsx";
import { useServerList } from "../../hooks/useServerList.js";

const LABELS = {
  REQUESTED: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối",
  RECEIVED: "Kho đã nhận", PARTIALLY_REFUNDED: "Hoàn một phần", REFUNDED: "Đã hoàn tiền"
};

export default function ReturnQueuePage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [status, setStatus] = useState("OPEN");
  const [pending, setPending] = useState(null);
  const list = useServerList({ defaultSortKey: "createdAt", defaultSortDir: "desc" });
  const params = { ...list.request, status: status === "ALL" ? undefined : status };
  const query = useQuery({ queryKey: ["admin", "returns", "page", params], queryFn: () => adminApi.listReturnRequestsPage(params) });
  const mutation = useMutation({
    mutationFn: ({ row, action }) => {
      if (action === "approve") return adminApi.approveReturnRequest(row.orderId, "Duyệt từ hàng đợi trả hàng");
      if (action === "reject") return adminApi.rejectReturnRequest(row.orderId, "Từ chối từ hàng đợi trả hàng");
      return adminApi.receiveReturnRequest(row.orderId, "Kho xác nhận đã nhận hàng hoàn");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      pushToast("Đã cập nhật yêu cầu trả hàng");
      setPending(null);
    }
  });
  const rows = query.data?.content || [];

  return <div>
    <PageHeader title="Trả hàng" crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Trả hàng" }]}
      description="Theo dõi và xử lý tập trung các yêu cầu trả hàng của khách." />
    <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
      <SearchField value={list.queryText} onChange={list.setQueryText} placeholder="Tìm mã đơn hoặc lý do..." />
      <select className="form-select form-select-sm list-filter" value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="OPEN">Cần xử lý</option><option value="ALL">Tất cả</option>
        {Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
    {(query.isError || mutation.isError) && <ErrorAlert error={query.error || mutation.error} />}
    {query.isLoading ? <SkeletonBlock rows={6} /> : <div className="card"><div className="card-body p-0">
      <DataTable rows={rows} rowKey={(row) => row.id} emptyTitle="Không có yêu cầu trả hàng" columns={[
        { key: "orderId", header: "Đơn", render: (row) => <Link to={`/orders/${row.orderId}`}>#{row.orderId.slice(0, 8).toUpperCase()}</Link> },
        { key: "status", header: "Trạng thái", render: (row) => <StatusBadge className={["REJECTED"].includes(row.status) ? "badge-soft-danger" : ["REFUNDED", "RECEIVED"].includes(row.status) ? "badge-soft-success" : "badge-soft-warning"} label={LABELS[row.status] || row.status} /> },
        { key: "reason", header: "Lý do" },
        { key: "items", header: "Số mặt hàng", render: (row) => row.items?.length || 0 },
        { key: "createdAt", header: "Yêu cầu lúc", render: (row) => formatDateTime(row.createdAt) },
        { key: "actions", header: "", render: (row) => <div className="d-flex gap-2">
          {row.status === "REQUESTED" && <button className="btn btn-lyra btn-sm" onClick={() => setPending({ row, action: "approve" })}>Duyệt</button>}
          {row.status === "REQUESTED" && <button className="btn btn-outline-danger btn-sm" onClick={() => setPending({ row, action: "reject" })}>Từ chối</button>}
          {row.status === "APPROVED" && <button className="btn btn-lyra btn-sm" onClick={() => setPending({ row, action: "receive" })}>Đã nhận hàng</button>}
        </div> }
      ]} />
      <PaginationBar page={list.page} totalPages={Math.max(1, query.data?.totalPages || 1)} total={query.data?.totalElements || 0} pageSize={list.pageSize} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} />
    </div></div>}
    <ConfirmModal open={Boolean(pending)} title="Xác nhận xử lý trả hàng"
      message={pending ? `${pending.action === "approve" ? "Duyệt" : pending.action === "reject" ? "Từ chối" : "Xác nhận đã nhận"} yêu cầu của đơn #${pending.row.orderId.slice(0, 8).toUpperCase()}?` : ""}
      confirmLabel="Xác nhận" danger={pending?.action === "reject"} onCancel={() => setPending(null)}
      onConfirm={() => mutation.mutate(pending)} />
  </div>;
}

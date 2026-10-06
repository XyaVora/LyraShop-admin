import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime } from "../../utils/format.js";
import SearchField from "../../components/common/SearchField.jsx";
import PaginationBar from "../../components/tables/PaginationBar.jsx";
import { useServerList } from "../../hooks/useServerList.js";

export default function AuditLogPage() {
  const list = useServerList({ defaultSortKey: "createdAt", defaultSortDir: "desc" });
  const query = useQuery({ queryKey: ["admin", "audit-logs", "page", list.request], queryFn: () => adminApi.listAuditLogsPage(list.request) });
  const rows = query.data?.content || [];
  return <div>
    <PageHeader title="Nhật ký quản trị" crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Nhật ký" }]} description="Tra cứu các thao tác ghi dữ liệu và kết quả xử lý của backend." />
    <div className="mb-3"><SearchField value={list.queryText} onChange={list.setQueryText} placeholder="Tìm tài nguyên, đường dẫn hoặc ID..." /></div>
    {query.isError && <ErrorAlert error={query.error} />}
    {query.isLoading ? <SkeletonBlock rows={8} /> : <div className="card card-body p-0"><DataTable rows={rows} rowKey={(row) => row.id} emptyTitle="Chưa có thao tác quản trị" columns={[
      { key: "createdAt", header: "Thời gian", render: (row) => formatDateTime(row.createdAt) },
      { key: "adminId", header: "Admin", render: (row) => String(row.adminId).slice(0, 8) },
      { key: "action", header: "Hành động", render: (row) => row.action || row.method },
      { key: "resourceType", header: "Loại", render: (row) => row.resourceId ? `${row.resourceType} · ${String(row.resourceId).slice(0, 8)}` : row.resourceType || row.path },
      { key: "responseStatus", header: "HTTP" },
      { key: "ipAddress", header: "IP" }
    ]} /><PaginationBar page={list.page} totalPages={Math.max(1, query.data?.totalPages || 1)} total={query.data?.totalElements || 0} pageSize={list.pageSize} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} /></div>}
  </div>;
}

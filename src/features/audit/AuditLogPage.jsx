import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function AuditLogPage() {
  const query = useQuery({ queryKey: ["admin", "audit-logs"], queryFn: adminApi.listAuditLogs });
  return <div>
    <PageHeader title="Nhật ký quản trị" crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Nhật ký" }]} description="200 thao tác ghi dữ liệu gần nhất của quản trị viên." />
    {query.isError && <ErrorAlert error={query.error} />}
    {query.isLoading ? <SkeletonBlock rows={8} /> : <div className="card card-body"><DataTable rows={query.data || []} rowKey={(row) => row.id} emptyTitle="Chưa có thao tác quản trị" columns={[
      { key: "createdAt", header: "Thời gian", render: (row) => formatDateTime(row.createdAt) },
      { key: "adminId", header: "Admin", render: (row) => String(row.adminId).slice(0, 8) },
      { key: "method", header: "Phương thức" },
      { key: "path", header: "Tài nguyên" },
      { key: "responseStatus", header: "HTTP" },
      { key: "ipAddress", header: "IP" }
    ]} /></div>}
  </div>;
}

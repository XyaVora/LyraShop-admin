import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import ExportCsvButton from "../../components/common/ExportCsvButton.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import PaginationBar from "../../components/tables/PaginationBar.jsx";
import { useServerList } from "../../hooks/useServerList.js";
import { useAuthStore } from "../../store/authStore.js";
import { activeClass } from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";
import { loadAllPages } from "../../utils/csv.js";

export default function UserListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const subject = useAuthStore((state) => state.subject);
  const currentRole = useAuthStore((state) => state.role);
  const canManageUsers = currentRole === "ADMIN";
  const pushToast = useToastStore((state) => state.push);
  const [roleFilter, setRoleFilter] = useState("all");
  const [pendingUser, setPendingUser] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);
  const list = useServerList({ defaultSortKey: "email" });
  const params = { ...list.request, role: roleFilter === "all" ? undefined : roleFilter };
  const query = useQuery({
    queryKey: ["admin", "users", "page", params],
    queryFn: () => adminApi.listUsersPage(params)
  });
  const rows = query.data?.content || [];
  const mutation = useMutation({
    mutationFn: ({ id, active }) => adminApi.updateUserStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      pushToast("Đã cập nhật tài khoản");
    }
  });
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      pushToast("Đã đổi vai trò");
    }
  });
  return (
    <div>
      <PageHeader
        title="Tài khoản"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Tài khoản" }]}
        description="ADMIN quản lý trạng thái và phân vai; hệ thống không cho khóa chính mình hoặc hạ admin hoạt động cuối cùng."
      />
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <SearchField value={list.queryText} onChange={list.setQueryText} placeholder="Tìm email, tên, SĐT..." />
        <select
          className="form-select form-select-sm list-filter"
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value);
            list.setPage(1);
          }}
          aria-label="Lọc vai trò"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị</option>
          <option value="CATALOG_MANAGER">Quản lý catalog</option>
          <option value="ORDER_MANAGER">Quản lý đơn hàng</option>
          <option value="SUPPORT">Hỗ trợ khách hàng</option>
          <option value="CUSTOMER">Khách</option>
        </select>
        <ExportCsvButton
          filename="lyra-users.csv"
          rows={rows}
          loadRows={() => loadAllPages(adminApi.listUsersPage, params)}
          columns={[
            { header: "id", value: (row) => row.id },
            { header: "email", value: (row) => row.email },
            { header: "fullName", value: (row) => row.fullName },
            { header: "phone", value: (row) => row.phone },
            { header: "role", value: (row) => row.role },
            { header: "active", value: (row) => row.active }
          ]}
        />
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      {roleMutation.isError && <ErrorAlert error={roleMutation.error} />}
      {query.isLoading ? <SkeletonBlock rows={6} /> : (
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              rows={rows}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/users/${row.id}`)}
              emptyTitle="Chưa có tài khoản"
              emptyDescription="Thử đổi bộ lọc tìm kiếm."
              sortKey={list.sortKey}
              sortDir={list.sortDir}
              onSort={list.toggleSort}
              columns={[
                { key: "email", header: "Email", sortable: true },
                { key: "fullName", header: "Tên", sortable: true },
                { key: "phone", header: "SĐT", sortable: true },
                {
                  key: "role",
                  header: "Vai trò",
                  sortable: true,
                  render: (row) => ({ ADMIN: "Quản trị", CATALOG_MANAGER: "Quản lý catalog", ORDER_MANAGER: "Quản lý đơn hàng", SUPPORT: "Hỗ trợ", CUSTOMER: "Khách" }[row.role] || row.role)
                },
                {
                  key: "active",
                  header: "Trạng thái",
                  sortable: true,
                  render: (row) => (
                    <StatusBadge
                      className={activeClass(row.active)}
                      label={row.active ? "Hoạt động" : "Đã khóa"}
                    />
                  )
                },
                {
                  key: "actions",
                  header: "",
                  stopRowClick: true,
                  render: (row) => {
                    if (!canManageUsers) return null;
                    const isSelf = row.id === subject;
                    return (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          disabled={isSelf || mutation.isPending}
                          onClick={() => setPendingUser(row)}
                        >
                          {row.active ? "Khóa" : "Mở"}
                        </button>
                        <select className="form-select form-select-sm" value={row.role} disabled={isSelf || roleMutation.isPending} onChange={(event) => setPendingRole({ user: row, role: event.target.value })} aria-label={`Đổi vai trò ${row.email}`}>
                          <option value="CUSTOMER">Khách</option><option value="ADMIN">Quản trị</option><option value="CATALOG_MANAGER">Quản lý catalog</option><option value="ORDER_MANAGER">Quản lý đơn hàng</option><option value="SUPPORT">Hỗ trợ</option>
                        </select>
                      </div>
                    );
                  }
                }
              ]}
            />
            <PaginationBar
              page={list.page}
              totalPages={Math.max(1, query.data?.totalPages || 1)}
              total={query.data?.totalElements || 0}
              pageSize={list.pageSize}
              onPageChange={list.setPage}
              onPageSizeChange={list.setPageSize}
            />
          </div>
        </div>
      )}
      <ConfirmModal
        open={Boolean(pendingUser)}
        title={pendingUser?.active ? "Khóa tài khoản" : "Mở tài khoản"}
        message={pendingUser?.active
          ? `${pendingUser?.email || ""} sẽ không đăng nhập được.`
          : `Mở lại ${pendingUser?.email || ""}.`}
        confirmLabel={pendingUser?.active ? "Khóa" : "Mở"}
        danger={Boolean(pendingUser?.active)}
        onCancel={() => setPendingUser(null)}
        onConfirm={() => {
          mutation.mutate({ id: pendingUser.id, active: !pendingUser.active });
          setPendingUser(null);
        }}
      />
      <ConfirmModal
        open={Boolean(pendingRole)}
        title="Đổi vai trò"
        message={pendingRole ? `Đổi vai trò của ${pendingRole.user.email} thành ${{ ADMIN: "Quản trị", CATALOG_MANAGER: "Quản lý catalog", ORDER_MANAGER: "Quản lý đơn hàng", SUPPORT: "Hỗ trợ", CUSTOMER: "Khách" }[pendingRole.role]}.` : ""}
        confirmLabel="Đổi"
        danger={pendingRole?.user?.role === "ADMIN"}
        onCancel={() => setPendingRole(null)}
        onConfirm={() => {
          roleMutation.mutate({
            id: pendingRole.user.id,
            role: pendingRole.role
          });
          setPendingRole(null);
        }}
      />
    </div>
  );
}

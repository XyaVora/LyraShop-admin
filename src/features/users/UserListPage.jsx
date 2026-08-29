import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { filterRows } from "../../utils/filter.js";
import { activeClass } from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";

export default function UserListPage() {
  const queryClient = useQueryClient();
  const subject = useAuthStore((state) => state.subject);
  const pushToast = useToastStore((state) => state.push);
  const [queryText, setQueryText] = useState("");
  const query = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.listUsers
  });
  const mutation = useMutation({
    mutationFn: ({ id, active }) => adminApi.updateUserStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      pushToast("Đã cập nhật tài khoản");
    }
  });
  const rows = filterRows(query.data || [], queryText, ["email", "fullName", "phone", "role"]);

  return (
    <div>
      <PageHeader
        title="Tài khoản"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Tài khoản" }]}
      />
      <div className="mb-3">
        <SearchField value={queryText} onChange={setQueryText} placeholder="Tìm email, tên, SĐT..." />
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      {query.isLoading ? <SkeletonBlock rows={6} /> : (
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              rows={rows}
              rowKey={(row) => row.id}
              emptyTitle="Chưa có tài khoản"
              columns={[
                { key: "email", header: "Email" },
                { key: "fullName", header: "Tên" },
                { key: "phone", header: "SĐT" },
                {
                  key: "role",
                  header: "Vai trò",
                  render: (row) => (row.role === "ADMIN" ? "Quản trị" : "Khách")
                },
                {
                  key: "active",
                  header: "Trạng thái",
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
                  render: (row) => {
                    const isSelf = row.id === subject;
                    return (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={isSelf || mutation.isPending}
                        onClick={() => mutation.mutate({ id: row.id, active: !row.active })}
                      >
                        {row.active ? "Khóa" : "Mở"}
                      </button>
                    );
                  }
                }
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

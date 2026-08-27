import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { useAuthStore } from "../../store/authStore.js";

export default function UserListPage() {
  const queryClient = useQueryClient();
  const subject = useAuthStore((state) => state.subject);
  const query = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.listUsers
  });
  const mutation = useMutation({
    mutationFn: ({ id, active }) => adminApi.updateUserStatus(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
  });

  return (
    <div>
      <h1 className="h4 mb-4">Tai khoan</h1>
      {query.isError && <ErrorAlert error={query.error} />}
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      {query.isLoading ? <LoadingState /> : (
        <div className="card card-body">
          <DataTable
            rows={query.data || []}
            rowKey={(row) => row.id}
            columns={[
              { key: "email", header: "Email" },
              { key: "fullName", header: "Ten" },
              { key: "phone", header: "SDT" },
              { key: "role", header: "Role" },
              {
                key: "active",
                header: "Trang thai",
                render: (row) => (row.active ? "Hoat dong" : "Khoa")
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
                      {row.active ? "Khoa" : "Mo"}
                    </button>
                  );
                }
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}

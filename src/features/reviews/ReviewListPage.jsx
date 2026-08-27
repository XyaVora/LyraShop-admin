import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function ReviewListPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: adminApi.listReviews
  });
  const mutation = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] })
  });

  return (
    <div>
      <h1 className="h4 mb-4">Danh gia</h1>
      {query.isError && <ErrorAlert error={query.error} />}
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      {query.isLoading ? <LoadingState /> : (
        <div className="card card-body">
          <DataTable
            rows={query.data || []}
            rowKey={(row) => row.id}
            columns={[
              { key: "id", header: "ID" },
              { key: "productId", header: "San pham" },
              { key: "userId", header: "User" },
              { key: "rating", header: "Diem" },
              { key: "comment", header: "Noi dung" },
              {
                key: "createdAt",
                header: "Luc",
                render: (row) => formatDateTime(row.createdAt)
              },
              {
                key: "actions",
                header: "",
                render: (row) => (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    disabled={mutation.isPending}
                    onClick={() => {
                      if (window.confirm("Xoa danh gia nay?")) {
                        mutation.mutate(row.id);
                      }
                    }}
                  >
                    Xoa
                  </button>
                )
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}

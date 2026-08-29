import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime } from "../../utils/format.js";
import { filterRows } from "../../utils/filter.js";
import { useToastStore } from "../../store/toastStore.js";

export default function ReviewListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [queryText, setQueryText] = useState("");
  const query = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: adminApi.listReviews
  });
  const mutation = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      pushToast("Đã xóa đánh giá");
    }
  });
  const rows = filterRows(query.data || [], queryText, ["comment", "productId", "userId", "rating"]);

  return (
    <div>
      <PageHeader
        title="Đánh giá"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Đánh giá" }]}
      />
      <div className="mb-3">
        <SearchField value={queryText} onChange={setQueryText} placeholder="Tìm nội dung đánh giá..." />
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      {query.isLoading ? <SkeletonBlock rows={6} /> : (
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              rows={rows}
              rowKey={(row) => row.id}
              emptyTitle="Chưa có đánh giá"
              columns={[
                { key: "id", header: "ID" },
                { key: "rating", header: "Điểm" },
                { key: "comment", header: "Nội dung" },
                {
                  key: "createdAt",
                  header: "Lúc",
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
                        if (window.confirm("Xóa đánh giá này?")) {
                          mutation.mutate(row.id);
                        }
                      }}
                    >
                      Xóa
                    </button>
                  )
                }
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

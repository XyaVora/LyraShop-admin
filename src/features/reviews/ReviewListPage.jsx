import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import ExportCsvButton from "../../components/common/ExportCsvButton.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import PaginationBar from "../../components/tables/PaginationBar.jsx";
import { useListView } from "../../hooks/useListView.js";
import { formatDateTime } from "../../utils/format.js";
import { useToastStore } from "../../store/toastStore.js";

const SEARCH_FIELDS = ["comment", "productId", "userId", "rating"];

export default function ReviewListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [pendingReview, setPendingReview] = useState(null);
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
  const extraFilter = useCallback((row) => (
    ratingFilter === "all" || Number(row.rating) === Number(ratingFilter)
  ), [ratingFilter]);
  const list = useListView(query.data || [], {
    fields: SEARCH_FIELDS,
    defaultSortKey: "createdAt",
    defaultSortDir: "desc",
    extraFilter
  });

  return (
    <div>
      <PageHeader
        title="Đánh giá"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Đánh giá" }]}
      />
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <SearchField value={list.queryText} onChange={list.setQueryText} placeholder="Tìm nội dung đánh giá..." />
        <select
          className="form-select form-select-sm list-filter"
          value={ratingFilter}
          onChange={(event) => {
            setRatingFilter(event.target.value);
            list.setPage(1);
          }}
          aria-label="Lọc điểm đánh giá"
        >
          <option value="all">Tất cả điểm</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>{rating} sao</option>
          ))}
        </select>
        <ExportCsvButton
          filename="lyra-reviews.csv"
          rows={list.allRows}
          columns={[
            { header: "id", value: (row) => row.id },
            { header: "productId", value: (row) => row.productId },
            { header: "userId", value: (row) => row.userId },
            { header: "rating", value: (row) => row.rating },
            { header: "comment", value: (row) => row.comment },
            { header: "createdAt", value: (row) => row.createdAt }
          ]}
        />
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      {query.isLoading ? <SkeletonBlock rows={6} /> : (
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              rows={list.rows}
              rowKey={(row) => row.id}
              emptyTitle="Chưa có đánh giá"
              emptyDescription="Thử đổi bộ lọc điểm hoặc nội dung."
              sortKey={list.sortKey}
              sortDir={list.sortDir}
              onSort={list.toggleSort}
              columns={[
                { key: "id", header: "ID", sortable: true },
                { key: "rating", header: "Điểm", sortable: true },
                { key: "comment", header: "Nội dung", sortable: true },
                {
                  key: "createdAt",
                  header: "Lúc",
                  sortable: true,
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
                      onClick={() => setPendingReview(row)}
                    >
                      Xóa
                    </button>
                  )
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
      <ConfirmModal
        open={Boolean(pendingReview)}
        title="Xóa đánh giá"
        message="Đánh giá sẽ bị xóa khỏi sản phẩm. Không hoàn tác được."
        confirmLabel="Xóa"
        danger
        onCancel={() => setPendingReview(null)}
        onConfirm={() => {
          mutation.mutate(pendingReview.id);
          setPendingReview(null);
        }}
      />
    </div>
  );
}

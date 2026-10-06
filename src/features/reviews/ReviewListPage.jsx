import { useState } from "react";
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
import { useServerList } from "../../hooks/useServerList.js";
import { formatDateTime } from "../../utils/format.js";
import { useToastStore } from "../../store/toastStore.js";
import { loadAllPages } from "../../utils/csv.js";

export default function ReviewListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [moderationFilter, setModerationFilter] = useState("all");
  const [pendingReview, setPendingReview] = useState(null);
  const list = useServerList({ defaultSortKey: "createdAt", defaultSortDir: "desc" });
  const params = { ...list.request, rating: ratingFilter === "all" ? undefined : Number(ratingFilter), moderationStatus: moderationFilter === "all" ? undefined : moderationFilter };
  const query = useQuery({
    queryKey: ["admin", "reviews", "page", params],
    queryFn: () => adminApi.listReviewsPage(params)
  });
  const rows = query.data?.content || [];
  const mutation = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      pushToast("Đã xóa đánh giá");
    }
  });
  const moderation = useMutation({
    mutationFn: ({ id, status }) => adminApi.moderateReview(id, status, status === "HIDDEN" ? "Ẩn bởi quản trị viên" : "Khôi phục bởi quản trị viên"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      pushToast("Đã cập nhật trạng thái đánh giá");
    }
  });
  return (
    <div>
      <PageHeader
        title="Đánh giá"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Đánh giá" }]}
        description="Danh sách toàn shop, kể cả sản phẩm ẩn. Trang chi tiết lọc theo productId từ API này."
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
        <select className="form-select form-select-sm list-filter" value={moderationFilter} onChange={(event) => { setModerationFilter(event.target.value); list.setPage(1); }} aria-label="Lọc trạng thái kiểm duyệt">
          <option value="all">Tất cả kiểm duyệt</option><option value="PUBLISHED">Đang công khai</option><option value="HIDDEN">Đã ẩn</option>
        </select>
        <ExportCsvButton
          filename="lyra-reviews.csv"
          rows={rows}
          loadRows={() => loadAllPages(adminApi.listReviewsPage, params)}
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
      {moderation.isError && <ErrorAlert error={moderation.error} />}
      {query.isLoading ? <SkeletonBlock rows={6} /> : (
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              rows={rows}
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
                { key: "moderationStatus", header: "Kiểm duyệt", render: (row) => row.moderationStatus === "HIDDEN" ? "Đã ẩn" : "Công khai" },
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
                    <div className="d-flex gap-2"><button type="button" className="btn btn-outline-secondary btn-sm" disabled={moderation.isPending} onClick={() => moderation.mutate({ id: row.id, status: row.moderationStatus === "HIDDEN" ? "PUBLISHED" : "HIDDEN" })}>{row.moderationStatus === "HIDDEN" ? "Công khai" : "Ẩn"}</button><button type="button" className="btn btn-outline-danger btn-sm" disabled={mutation.isPending} onClick={() => setPendingReview(row)}>Xóa</button></div>
                  )
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

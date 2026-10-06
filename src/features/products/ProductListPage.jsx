import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
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
import { formatMoney } from "../../utils/format.js";
import { activeClass } from "../../utils/status.js";
import { loadAllPages } from "../../utils/csv.js";
import { useToastStore } from "../../store/toastStore.js";

export default function ProductListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pendingHide, setPendingHide] = useState(null);
  const list = useServerList({ defaultSortKey: "name" });
  const params = { ...list.request, active: activeFilter === "all" ? undefined : activeFilter === "active" };
  const query = useQuery({
    queryKey: ["admin", "products", "page", params],
    queryFn: () => adminApi.listProductsPage(params)
  });
  const rows = query.data?.content || [];
  const activate = useMutation({
    mutationFn: adminApi.activateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      pushToast("Đã hiện sản phẩm");
    }
  });
  const deactivate = useMutation({
    mutationFn: adminApi.deactivateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      pushToast("Đã ẩn sản phẩm");
    }
  });
  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Sản phẩm" }]}
        actions={<Link className="btn btn-lyra btn-sm" to="/products/new">Tạo sản phẩm</Link>}
        description="Danh sách quản trị đủ cả sản phẩm ẩn. Chi tiết gồm version, biến thể ẩn/hiện và tồn kho."
      />
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <SearchField
          value={list.queryText}
          onChange={list.setQueryText}
          placeholder="Tìm theo tên hoặc slug..."
        />
        <select
          className="form-select form-select-sm list-filter"
          value={activeFilter}
          onChange={(event) => {
            setActiveFilter(event.target.value);
            list.setPage(1);
          }}
          aria-label="Lọc trạng thái sản phẩm"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiện</option>
          <option value="hidden">Đang ẩn</option>
        </select>
        <ExportCsvButton
          filename="lyra-products.csv"
          rows={rows}
          loadRows={() => loadAllPages(adminApi.listProductsPage, params)}
          columns={[
            { header: "id", value: (row) => row.id },
            { header: "name", value: (row) => row.name },
            { header: "slug", value: (row) => row.slug },
            { header: "basePrice", value: (row) => row.basePrice },
            { header: "categoryId", value: (row) => row.categoryId },
            { header: "active", value: (row) => row.active }
          ]}
        />
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {(activate.error || deactivate.error) && (
        <ErrorAlert error={activate.error || deactivate.error} />
      )}
      {query.isLoading ? (
        <SkeletonBlock rows={6} />
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <DataTable
              rows={rows}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/products/${row.id}`)}
              emptyTitle="Chưa có sản phẩm"
              emptyDescription="Tạo sản phẩm đầu tiên hoặc nới bộ lọc."
              sortKey={list.sortKey}
              sortDir={list.sortDir}
              onSort={list.toggleSort}
              columns={[
                { key: "name", header: "Tên", sortable: true },
                { key: "slug", header: "Slug", sortable: true },
                {
                  key: "basePrice",
                  header: "Giá",
                  sortable: true,
                  render: (row) => formatMoney(row.basePrice)
                },
                { key: "categoryId", header: "Danh mục", sortable: true },
                {
                  key: "active",
                  header: "Trạng thái",
                  sortable: true,
                  render: (row) => (
                    <StatusBadge
                      className={activeClass(row.active)}
                      label={row.active ? "Hiện" : "Ẩn"}
                    />
                  )
                },
                {
                  key: "actions",
                  header: "",
                  stopRowClick: true,
                  render: (row) => (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => (row.active ? setPendingHide(row) : activate.mutate(row.id))}
                    >
                      {row.active ? "Ẩn" : "Hiện"}
                    </button>
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
        open={Boolean(pendingHide)}
        title="Ẩn sản phẩm"
        message={`"${pendingHide?.name || ""}" sẽ không còn hiện trên catalog công khai.`}
        confirmLabel="Ẩn"
        danger
        onCancel={() => setPendingHide(null)}
        onConfirm={() => {
          deactivate.mutate(pendingHide.id);
          setPendingHide(null);
        }}
      />
    </div>
  );
}

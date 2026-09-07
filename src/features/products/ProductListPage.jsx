import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import PaginationBar from "../../components/tables/PaginationBar.jsx";
import { useListView } from "../../hooks/useListView.js";
import { formatMoney } from "../../utils/format.js";
import { activeClass } from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";

const SEARCH_FIELDS = ["name", "slug"];

export default function ProductListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [activeFilter, setActiveFilter] = useState("all");
  const query = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminApi.listProducts
  });
  const extraFilter = useCallback((row) => {
    if (activeFilter === "active") {
      return row.active;
    }
    if (activeFilter === "hidden") {
      return !row.active;
    }
    return true;
  }, [activeFilter]);
  const list = useListView(query.data || [], {
    fields: SEARCH_FIELDS,
    defaultSortKey: "name",
    extraFilter
  });
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
              rows={list.rows}
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
                      onClick={() => (row.active ? deactivate : activate).mutate(row.id)}
                    >
                      {row.active ? "Ẩn" : "Hiện"}
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
    </div>
  );
}

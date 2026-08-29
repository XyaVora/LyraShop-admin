import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatMoney } from "../../utils/format.js";
import { filterRows } from "../../utils/filter.js";
import { activeClass } from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";

export default function ProductListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [queryText, setQueryText] = useState("");
  const query = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminApi.listProducts
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
  const rows = filterRows(query.data || [], queryText, ["name", "slug"]);

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Sản phẩm" }]}
        actions={<Link className="btn btn-lyra btn-sm" to="/products/new">Tạo sản phẩm</Link>}
      />
      <div className="mb-3">
        <SearchField
          value={queryText}
          onChange={setQueryText}
          placeholder="Tìm theo tên hoặc slug..."
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
              emptyDescription="Tạo sản phẩm đầu tiên để bắt đầu catalog."
              columns={[
                { key: "name", header: "Tên" },
                { key: "slug", header: "Slug" },
                {
                  key: "basePrice",
                  header: "Giá",
                  render: (row) => formatMoney(row.basePrice)
                },
                { key: "categoryId", header: "Danh mục" },
                {
                  key: "active",
                  header: "Trạng thái",
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
          </div>
        </div>
      )}
    </div>
  );
}

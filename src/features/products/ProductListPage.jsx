import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatMoney } from "../../utils/format.js";

export default function ProductListPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminApi.listProducts
  });
  const activate = useMutation({
    mutationFn: adminApi.activateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
  });
  const deactivate = useMutation({
    mutationFn: adminApi.deactivateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0">San pham</h1>
        <Link className="btn btn-dark btn-sm" to="/products/new">Tao san pham</Link>
      </div>
      {query.isError && <ErrorAlert error={query.error} />}
      {(activate.error || deactivate.error) && (
        <ErrorAlert error={activate.error || deactivate.error} />
      )}
      {query.isLoading ? (
        <LoadingState />
      ) : (
        <div className="card">
          <div className="card-body">
            <DataTable
              rows={query.data || []}
              rowKey={(row) => row.id}
              columns={[
                {
                  key: "name",
                  header: "Ten",
                  render: (row) => <Link to={`/products/${row.id}`}>{row.name}</Link>
                },
                { key: "slug", header: "Slug" },
                {
                  key: "basePrice",
                  header: "Gia",
                  render: (row) => formatMoney(row.basePrice)
                },
                { key: "categoryId", header: "Danh muc" },
                {
                  key: "active",
                  header: "Trang thai",
                  render: (row) => (row.active ? "Hien" : "An")
                },
                {
                  key: "actions",
                  header: "",
                  render: (row) => (
                    <div className="btn-group btn-group-sm">
                      {row.active ? (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => deactivate.mutate(row.id)}
                        >
                          An
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => activate.mutate(row.id)}
                        >
                          Kich hoat
                        </button>
                      )}
                    </div>
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

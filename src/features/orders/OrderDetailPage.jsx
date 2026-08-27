import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import { nextOrderStatus } from "../../services/api/endpoints.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";

export default function OrderDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: () => adminApi.getOrder(id)
  });
  const mutation = useMutation({
    mutationFn: (status) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  if (query.isLoading) {
    return <LoadingState />;
  }
  if (query.isError) {
    return <ErrorAlert error={query.error} />;
  }

  const order = query.data;
  const next = nextOrderStatus(order.status);

  return (
    <div>
      <h1 className="h4 mb-2">Don hang</h1>
      <p className="text-secondary">{order.id}</p>
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      <div className="card card-body mb-3">
        <div className="row">
          <div className="col-md-4"><strong>Trang thai:</strong> {order.status}</div>
          <div className="col-md-4"><strong>Thanh toan:</strong> {order.paymentMethod} / {order.paymentStatus}</div>
          <div className="col-md-4"><strong>Tong:</strong> {formatMoney(order.totalAmount)}</div>
          <div className="col-md-6 mt-2"><strong>Dia chi:</strong> {order.shippingAddress}</div>
          <div className="col-md-3 mt-2"><strong>SDT:</strong> {order.shippingPhone}</div>
          <div className="col-md-3 mt-2"><strong>Tao luc:</strong> {formatDateTime(order.createdAt)}</div>
        </div>
        {next ? (
          <button
            type="button"
            className="btn btn-dark btn-sm mt-3"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(next)}
          >
            Chuyen sang {next}
          </button>
        ) : (
          <p className="small text-secondary mb-0 mt-3">
            Khong the chuyen tiep (DELIVERED/CANCELLED hoac khong dung chuoi PENDING den DELIVERED).
          </p>
        )}
      </div>
      <div className="card card-body">
        <h2 className="h6">Hang muc</h2>
        <DataTable
          rows={order.items || []}
          rowKey={(row) => row.id}
          columns={[
            { key: "productName", header: "San pham" },
            { key: "sku", header: "SKU" },
            { key: "size", header: "Size" },
            { key: "color", header: "Mau" },
            { key: "quantity", header: "SL" },
            { key: "unitPrice", header: "Don gia", render: (row) => formatMoney(row.unitPrice) },
            { key: "subtotal", header: "Tam tinh", render: (row) => formatMoney(row.subtotal) }
          ]}
        />
      </div>
    </div>
  );
}

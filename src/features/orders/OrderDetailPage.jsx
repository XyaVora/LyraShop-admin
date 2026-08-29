import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import { nextOrderStatus } from "../../services/api/endpoints.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  orderStatusClass,
  paymentStatusClass
} from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";

export default function OrderDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
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
      pushToast("Đã cập nhật trạng thái đơn");
    }
  });

  if (query.isLoading) {
    return <SkeletonBlock rows={8} />;
  }
  if (query.isError) {
    return <ErrorAlert error={query.error} />;
  }

  const order = query.data;
  const next = nextOrderStatus(order.status);

  return (
    <div>
      <PageHeader
        title="Chi tiết đơn hàng"
        crumbs={[
          { label: "Tổng quan", to: "/" },
          { label: "Đơn hàng", to: "/orders" },
          { label: order.id.slice(0, 8) }
        ]}
      />
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      <div className="card card-body mb-3">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="text-secondary small">Trạng thái</div>
            <StatusBadge
              className={orderStatusClass(order.status)}
              label={ORDER_STATUS_LABEL[order.status] || order.status}
            />
          </div>
          <div className="col-md-4">
            <div className="text-secondary small">Thanh toán</div>
            <div>
              {PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod}
              {" · "}
              <StatusBadge
                className={paymentStatusClass(order.paymentStatus)}
                label={PAYMENT_STATUS_LABEL[order.paymentStatus] || order.paymentStatus}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-secondary small">Tổng</div>
            <div className="fw-semibold">{formatMoney(order.totalAmount)}</div>
          </div>
          <div className="col-md-6"><strong>Địa chỉ:</strong> {order.shippingAddress}</div>
          <div className="col-md-3"><strong>SĐT:</strong> {order.shippingPhone}</div>
          <div className="col-md-3"><strong>Tạo lúc:</strong> {formatDateTime(order.createdAt)}</div>
        </div>
        {next ? (
          <button
            type="button"
            className="btn btn-lyra btn-sm mt-3"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(next)}
          >
            Chuyển sang {ORDER_STATUS_LABEL[next] || next}
          </button>
        ) : (
          <p className="small text-secondary mb-0 mt-3">
            Không thể chuyển tiếp (đã giao, đã hủy, hoặc không đúng chuỗi chờ xác nhận đến đã giao).
          </p>
        )}
      </div>
      <div className="card">
        <div className="card-body">
          <h2 className="h6">Hạng mục</h2>
          <DataTable
            rows={order.items || []}
            rowKey={(row) => row.id}
            emptyTitle="Đơn không có hạng mục"
            columns={[
              { key: "productName", header: "Sản phẩm" },
              { key: "sku", header: "SKU" },
              { key: "size", header: "Size" },
              { key: "color", header: "Màu" },
              { key: "quantity", header: "SL" },
              { key: "unitPrice", header: "Đơn giá", render: (row) => formatMoney(row.unitPrice) },
              { key: "subtotal", header: "Tạm tính", render: (row) => formatMoney(row.subtotal) }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

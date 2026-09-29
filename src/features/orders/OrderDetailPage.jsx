import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  const [decisionNote, setDecisionNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const trackingForm = useForm({
    defaultValues: {
      carrier: "",
      trackingCode: "",
      trackingUrl: "",
      estimatedDeliveryAt: ""
    }
  });
  const trackingEventForm = useForm({
    defaultValues: {
      status: "IN_TRANSIT",
      description: "",
      location: "",
      occurredAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    }
  });
  const refundForm = useForm({ defaultValues: { amount: 0, reference: "", note: "" } });
  const { reset: resetTrackingForm } = trackingForm;
  const query = useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: () => adminApi.getOrder(id)
  });
  const trackingEvents = useQuery({
    queryKey: ["admin", "orders", id, "tracking-events"],
    queryFn: () => adminApi.listOrderTrackingEvents(id)
  });
  const returnRequest = useQuery({
    queryKey: ["admin", "orders", id, "return-request"],
    queryFn: () => adminApi.getOrderReturnRequest(id),
    enabled: Boolean(query.data?.returnStatus)
  });
  const refunds = useQuery({
    queryKey: ["admin", "orders", id, "refunds"],
    queryFn: () => adminApi.listRefunds(id)
  });
  function refreshAfterSale() {
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", id, "return-request"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", id, "refunds"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", id, "tracking-events"] });
  }
  const mutation = useMutation({
    mutationFn: (status) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      pushToast("Đã cập nhật trạng thái đơn");
    }
  });
  const trackingMutation = useMutation({
    mutationFn: (values) => adminApi.updateOrderTracking(id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "orders", id], updated);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      pushToast("Đã cập nhật vận đơn");
    }
  });
  const trackingEventMutation = useMutation({
    mutationFn: (values) => adminApi.createOrderTrackingEvent(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", id, "tracking-events"] });
      trackingEventForm.reset({
        status: "IN_TRANSIT",
        description: "",
        location: "",
        occurredAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
      });
      pushToast("Đã thêm sự kiện vận chuyển");
    }
  });
  const cancelMutation = useMutation({
    mutationFn: () => adminApi.cancelOrder(id, cancelReason),
    onSuccess: () => {
      setCancelReason("");
      refreshAfterSale();
      pushToast("Đã hủy đơn hàng");
    }
  });
  const returnMutation = useMutation({
    mutationFn: ({ action, note }) => {
      if (action === "approve") return adminApi.approveReturnRequest(id, note);
      if (action === "reject") return adminApi.rejectReturnRequest(id, note);
      return adminApi.receiveReturnRequest(id, note);
    },
    onSuccess: () => {
      setDecisionNote("");
      refreshAfterSale();
      pushToast("Đã cập nhật yêu cầu trả hàng");
    }
  });
  const refundMutation = useMutation({
    mutationFn: (values) => adminApi.createRefund(id, values),
    onSuccess: () => {
      refundForm.reset({ amount: 0, reference: "", note: "" });
      refreshAfterSale();
      pushToast("Đã ghi nhận giao dịch hoàn tiền");
    }
  });

  const order = query.data;
  useEffect(() => {
    if (!order) {
      return;
    }
    resetTrackingForm({
      carrier: order.shippingCarrier || "",
      trackingCode: order.trackingCode || "",
      trackingUrl: order.trackingUrl || "",
      estimatedDeliveryAt: order.estimatedDeliveryAt
        ? new Date(order.estimatedDeliveryAt).toISOString().slice(0, 16)
        : ""
    });
  }, [order, resetTrackingForm]);

  if (query.isLoading) {
    return <SkeletonBlock rows={8} />;
  }
  if (query.isError) {
    return <ErrorAlert error={query.error} />;
  }

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
        description="Theo dõi trạng thái, vận chuyển, trả hàng và hoàn tiền của đơn."
      />
      {mutation.isError && <ErrorAlert error={mutation.error} />}
      {trackingMutation.isError && <ErrorAlert error={trackingMutation.error} />}
      {trackingEvents.isError && <ErrorAlert error={trackingEvents.error} />}
      {trackingEventMutation.isError && <ErrorAlert error={trackingEventMutation.error} />}
      {cancelMutation.isError && <ErrorAlert error={cancelMutation.error} />}
      {returnRequest.isError && <ErrorAlert error={returnRequest.error} />}
      {returnMutation.isError && <ErrorAlert error={returnMutation.error} />}
      {refunds.isError && <ErrorAlert error={refunds.error} />}
      {refundMutation.isError && <ErrorAlert error={refundMutation.error} />}
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
            <div className="text-secondary small">Đã hoàn</div>
            <div className="fw-semibold">{formatMoney(order.refundedAmount || 0)}</div>
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
          {order.note && <div className="col-12"><strong>Ghi chú:</strong> {order.note}</div>}
          {order.giftWrap && (
            <div className="col-12">
              <strong>Gói quà:</strong> Có{order.giftMessage ? ` · ${order.giftMessage}` : ""}
            </div>
          )}
          {order.cancellationReason && (
            <div className="col-12"><strong>Lý do hủy:</strong> {order.cancellationReason}</div>
          )}
          {order.returnStatus && (
            <div className="col-12">
              <strong>Đổi/trả:</strong> {order.returnStatus}
              {order.returnReason ? ` · ${order.returnReason}` : ""}
            </div>
          )}
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
        {order.status === "PENDING" && (
          <form className="d-flex gap-2 mt-3" onSubmit={(event) => { event.preventDefault(); cancelMutation.mutate(); }}>
            <input className="form-control form-control-sm" value={cancelReason} maxLength={500}
              onChange={(event) => setCancelReason(event.target.value)} placeholder="Lý do hủy đơn" required />
            <button type="submit" className="btn btn-outline-danger btn-sm" disabled={cancelMutation.isPending}>Hủy đơn</button>
          </form>
        )}
      </div>
      {order.returnStatus && (
        <div className="card card-body mb-3">
          <h2 className="h6">Xử lý trả hàng</h2>
          {returnRequest.isLoading ? <SkeletonBlock rows={3} /> : returnRequest.data && (
            <>
              <div className="row g-2 small mb-3">
                <div className="col-md-3"><strong>Trạng thái:</strong> {returnRequest.data.status}</div>
                <div className="col-md-5"><strong>Lý do:</strong> {returnRequest.data.reason}</div>
                <div className="col-md-4"><strong>Yêu cầu lúc:</strong> {formatDateTime(returnRequest.data.createdAt)}</div>
              </div>
              <ul className="small">
                {(returnRequest.data.items || []).map((returned) => {
                  const item = (order.items || []).find((candidate) => candidate.id === returned.orderItemId);
                  return <li key={returned.orderItemId}>{item?.productName || `Hạng mục #${returned.orderItemId}`} · {item?.sku || "-"} · SL trả {returned.quantity}</li>;
                })}
              </ul>
              {(returnRequest.data.evidenceUrls || []).length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {returnRequest.data.evidenceUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm">Xem bằng chứng</a>)}
                </div>
              )}
              {["REQUESTED", "APPROVED"].includes(returnRequest.data.status) && (
                <div>
                  <textarea className="form-control form-control-sm mb-2" value={decisionNote} maxLength={500}
                    onChange={(event) => setDecisionNote(event.target.value)} placeholder="Ghi chú xử lý" />
                  <div className="d-flex gap-2">
                    {returnRequest.data.status === "REQUESTED" && <button type="button" className="btn btn-lyra btn-sm" onClick={() => returnMutation.mutate({ action: "approve", note: decisionNote })}>Duyệt trả hàng</button>}
                    {returnRequest.data.status === "REQUESTED" && <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => returnMutation.mutate({ action: "reject", note: decisionNote })}>Từ chối</button>}
                    {returnRequest.data.status === "APPROVED" && <button type="button" className="btn btn-lyra btn-sm" onClick={() => returnMutation.mutate({ action: "receive", note: decisionNote })}>Xác nhận kho đã nhận</button>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {order.paymentStatus === "PAID" && (order.status === "CANCELLED" || ["RECEIVED", "PARTIALLY_REFUNDED"].includes(order.returnStatus)) && (
        <form className="card card-body mb-3" onSubmit={refundForm.handleSubmit((values) => refundMutation.mutate(values))}>
          <h2 className="h6">Ghi nhận hoàn tiền</h2>
          <p className="small text-secondary">Nhập số tiền thực tế đã hoàn qua VNPay, ngân hàng hoặc tiền mặt. Mã tham chiếu phải duy nhất.</p>
          <div className="row g-2">
            <div className="col-md-3"><input type="number" min="0.01" step="0.01" className="form-control" placeholder="Số tiền" {...refundForm.register("amount", { required: true, valueAsNumber: true, min: 0.01 })} /></div>
            <div className="col-md-4"><input className="form-control" placeholder="Mã giao dịch hoàn" {...refundForm.register("reference", { required: true, maxLength: 100 })} /></div>
            <div className="col-md-5"><input className="form-control" placeholder="Ghi chú" {...refundForm.register("note", { maxLength: 500 })} /></div>
          </div>
          <button type="submit" className="btn btn-lyra btn-sm mt-2" disabled={refundMutation.isPending}>Xác nhận đã hoàn tiền</button>
        </form>
      )}
      {(refunds.data || []).length > 0 && (
        <div className="card card-body mb-3">
          <h2 className="h6">Lịch sử hoàn tiền</h2>
          <DataTable rows={refunds.data} rowKey={(row) => row.id} columns={[
            { key: "amount", header: "Số tiền", render: (row) => formatMoney(row.amount) },
            { key: "reference", header: "Mã tham chiếu" },
            { key: "note", header: "Ghi chú", render: (row) => row.note || "-" },
            { key: "createdAt", header: "Thời gian", render: (row) => formatDateTime(row.createdAt) }
          ]} />
        </div>
      )}
      <div className="row g-3 mb-3">
        <div className="col-lg-5">
          <div className="card card-body h-100">
            <h2 className="h6">Chi phí</h2>
            <dl className="row small mb-0">
              <dt className="col-7">Tiền hàng</dt><dd className="col-5 text-end">{formatMoney(order.subtotalAmount)}</dd>
              <dt className="col-7">Giảm giá</dt><dd className="col-5 text-end">{formatMoney(order.discountAmount)}</dd>
              <dt className="col-7">Xu đã dùng</dt><dd className="col-5 text-end">{order.loyaltyCoinsUsed || 0}</dd>
              <dt className="col-7">Giảm bằng xu</dt><dd className="col-5 text-end">{formatMoney(order.loyaltyDiscountAmount)}</dd>
              <dt className="col-7">Phí giao hàng</dt><dd className="col-5 text-end">{formatMoney(order.shippingFee)}</dd>
              <dt className="col-7">Phí gói quà</dt><dd className="col-5 text-end">{formatMoney(order.giftWrapFee)}</dd>
              {order.voucherCode && <><dt className="col-7">Voucher</dt><dd className="col-5 text-end">{order.voucherCode}</dd></>}
            </dl>
          </div>
        </div>
        <div className="col-lg-7">
          <form className="card card-body h-100" onSubmit={trackingForm.handleSubmit((values) => trackingMutation.mutate(values))}>
            <h2 className="h6">Vận đơn</h2>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label" htmlFor="shipping-carrier">Đơn vị vận chuyển</label>
                <input id="shipping-carrier" className="form-control" {...trackingForm.register("carrier", { required: true, maxLength: 100 })} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="tracking-code">Mã vận đơn</label>
                <input id="tracking-code" className="form-control" {...trackingForm.register("trackingCode", { required: true, maxLength: 100 })} />
              </div>
              <div className="col-md-7">
                <label className="form-label" htmlFor="tracking-url">Liên kết theo dõi</label>
                <input id="tracking-url" type="url" className="form-control" {...trackingForm.register("trackingUrl", { maxLength: 500 })} />
              </div>
              <div className="col-md-5">
                <label className="form-label" htmlFor="estimated-delivery">Dự kiến giao</label>
                <input id="estimated-delivery" type="datetime-local" className="form-control" {...trackingForm.register("estimatedDeliveryAt")} />
              </div>
            </div>
            <button type="submit" className="btn btn-outline-secondary btn-sm mt-3" disabled={trackingMutation.isPending}>
              Lưu vận đơn
            </button>
          </form>
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-lg-5">
          <form className="card card-body h-100" onSubmit={trackingEventForm.handleSubmit((values) => trackingEventMutation.mutate(values))}>
            <h2 className="h6">Thêm hành trình vận chuyển</h2>
            <label className="form-label" htmlFor="tracking-event-status">Trạng thái</label>
            <select id="tracking-event-status" className="form-select mb-2" {...trackingEventForm.register("status", { required: true })}>
              <option value="PICKED_UP">Đã lấy hàng</option>
              <option value="IN_TRANSIT">Đang trung chuyển</option>
              <option value="OUT_FOR_DELIVERY">Đang giao hàng</option>
              <option value="DELIVERY_ATTEMPTED">Giao hàng chưa thành công</option>
              <option value="DELIVERED">Đã giao hàng</option>
            </select>
            <label className="form-label" htmlFor="tracking-event-description">Mô tả</label>
            <textarea id="tracking-event-description" className="form-control mb-2" rows="2" {...trackingEventForm.register("description", { required: true, maxLength: 500 })} />
            <label className="form-label" htmlFor="tracking-event-location">Địa điểm</label>
            <input id="tracking-event-location" className="form-control mb-2" {...trackingEventForm.register("location", { maxLength: 255 })} />
            <label className="form-label" htmlFor="tracking-event-time">Thời gian</label>
            <input id="tracking-event-time" type="datetime-local" className="form-control" {...trackingEventForm.register("occurredAt", { required: true })} />
            <button type="submit" className="btn btn-lyra btn-sm mt-3" disabled={trackingEventMutation.isPending}>Thêm sự kiện</button>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="card card-body h-100">
            <h2 className="h6">Lịch sử vận chuyển</h2>
            {trackingEvents.isLoading ? <SkeletonBlock rows={3} /> : (trackingEvents.data || []).length === 0 ? (
              <p className="small text-secondary mb-0">Chưa có sự kiện vận chuyển.</p>
            ) : (
              <ol className="tracking-timeline mb-0">
                {trackingEvents.data.map((event) => (
                  <li key={event.id}>
                    <strong>{event.description}</strong>
                    <span>{event.status}{event.location ? ` · ${event.location}` : ""}</span>
                    <time>{formatDateTime(event.occurredAt)}</time>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
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

export const ORDER_STATUS_LABEL = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy"
};

export const PAYMENT_STATUS_LABEL = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Hoàn tiền"
};

export const PAYMENT_METHOD_LABEL = {
  COD: "Thu hộ (COD)"
};

export function orderStatusClass(status) {
  switch (status) {
    case "PENDING":
      return "badge-soft-warning";
    case "CONFIRMED":
      return "badge-soft-info";
    case "PROCESSING":
      return "badge-soft-primary";
    case "SHIPPING":
      return "badge-soft-info";
    case "DELIVERED":
      return "badge-soft-success";
    case "CANCELLED":
      return "badge-soft-muted";
    default:
      return "badge-soft-muted";
  }
}

export function paymentStatusClass(status) {
  switch (status) {
    case "PAID":
      return "badge-soft-success";
    case "UNPAID":
      return "badge-soft-warning";
    case "FAILED":
      return "badge-soft-danger";
    default:
      return "badge-soft-muted";
  }
}

export function activeClass(active) {
  return active ? "badge-soft-success" : "badge-soft-muted";
}

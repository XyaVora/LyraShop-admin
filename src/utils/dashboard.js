import { ORDER_STATUS_LABEL } from "./status.js";

const PIPELINE_KEYS = [
  "pending",
  "confirmed",
  "processing",
  "shipping",
  "delivered",
  "cancelled"
];

export function averagePaidOrder(revenue) {
  const total = Number(revenue?.paidTotal);
  const count = Number(revenue?.paidOrderCount);
  if (!Number.isFinite(total) || !Number.isFinite(count) || count <= 0) {
    return null;
  }
  return total / count;
}

export function cancelRate(orders) {
  const total = Number(orders?.total);
  const cancelled = Number(orders?.cancelled);
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(cancelled)) {
    return null;
  }
  return cancelled / total;
}

export function openOrderCount(orders) {
  return ["pending", "confirmed", "processing", "shipping"]
    .reduce((sum, key) => sum + (Number(orders?.[key]) || 0), 0);
}

export function orderPipeline(orders) {
  const total = Number(orders?.total) || 0;
  return PIPELINE_KEYS.map((key) => {
    const count = Number(orders?.[key]) || 0;
    return {
      key,
      label: ORDER_STATUS_LABEL[key.toUpperCase()] || key,
      count,
      share: total > 0 ? count / total : 0
    };
  });
}

export function formatPercent(value) {
  if (value == null || !Number.isFinite(value)) {
    return "-";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(value);
}

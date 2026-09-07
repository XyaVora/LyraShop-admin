import { describe, expect, it } from "vitest";
import {
  averagePaidOrder,
  cancelRate,
  formatPercent,
  openOrderCount,
  orderPipeline
} from "./dashboard.js";

const orders = {
  total: 10,
  pending: 2,
  confirmed: 1,
  processing: 1,
  shipping: 2,
  delivered: 3,
  cancelled: 1
};

describe("dashboard insights", () => {
  it("computes average paid order and cancel rate", () => {
    expect(averagePaidOrder({ paidTotal: 200000, paidOrderCount: 4 })).toBe(50000);
    expect(averagePaidOrder({ paidTotal: 0, paidOrderCount: 0 })).toBeNull();
    expect(cancelRate(orders)).toBe(0.1);
    expect(openOrderCount(orders)).toBe(6);
  });

  it("builds a pipeline share for every order status", () => {
    const pipeline = orderPipeline(orders);
    expect(pipeline.map((item) => item.key)).toEqual([
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "delivered",
      "cancelled"
    ]);
    expect(pipeline.find((item) => item.key === "delivered")).toMatchObject({
      count: 3,
      share: 0.3
    });
    expect(formatPercent(0.1)).toContain("%");
  });
});

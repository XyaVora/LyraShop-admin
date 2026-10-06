import { describe, expect, it } from "vitest";
import { chartPoints, dashboardAnalytics, percentageChange } from "./dashboardAnalytics.js";

describe("dashboard period analytics", () => {
  it("builds real 30-day revenue and comparison metrics from orders", () => {
    const now = new Date("2026-09-28T12:00:00Z");
    const analytics = dashboardAnalytics([
      { createdAt: "2026-09-28T08:00:00Z", paymentStatus: "PAID", status: "DELIVERED", totalAmount: 200 },
      { createdAt: "2026-09-20T08:00:00Z", paymentStatus: "UNPAID", status: "PROCESSING", totalAmount: 500 },
      { createdAt: "2026-08-20T08:00:00Z", paymentStatus: "PAID", status: "DELIVERED", totalAmount: 100 }
    ], now);

    expect(analytics.current).toMatchObject({ revenue: 200, paidCount: 1, totalOrders: 2 });
    expect(analytics.previous).toMatchObject({ revenue: 100, paidCount: 1, totalOrders: 1 });
    expect(analytics.changes.revenue).toBe(1);
    expect(analytics.series).toHaveLength(30);
    expect(analytics.series.at(-1).revenue).toBe(200);
  });

  it("does not invent a percentage when the previous period is zero", () => {
    expect(percentageChange(10, 0)).toBeNull();
    expect(chartPoints([{ revenue: 0 }, { revenue: 10 }], 100, 50)).toEqual([
      expect.objectContaining({ x: 0, y: 50 }),
      expect.objectContaining({ x: 100, y: 0 })
    ]);
  });

  it("uses payment time and subtracts partial refunds from revenue", () => {
    const now = new Date("2026-09-28T12:00:00Z");
    const analytics = dashboardAnalytics([{
      createdAt: "2026-07-01T08:00:00Z",
      paidAt: "2026-09-28T08:00:00Z",
      paymentStatus: "PAID",
      status: "DELIVERED",
      totalAmount: 500,
      refundedAmount: 125
    }], now);

    expect(analytics.current.revenue).toBe(375);
    expect(analytics.current.paidCount).toBe(1);
    expect(analytics.series.at(-1).revenue).toBe(375);
  });
});

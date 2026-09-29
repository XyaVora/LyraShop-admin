const DAY_MS = 24 * 60 * 60 * 1000;

function validDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function utcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function inPeriod(order, start, end) {
  const createdAt = validDate(order.createdAt);
  return createdAt && createdAt >= start && createdAt < end;
}

export function percentageChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return (current - previous) / Math.abs(previous);
}

export function summarizeOrders(orders, start, end) {
  const periodOrders = (orders || []).filter((order) => inPeriod(order, start, end));
  const paidOrders = periodOrders.filter((order) => order.paymentStatus === "PAID");
  const revenue = paidOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const delivered = periodOrders.filter((order) => order.status === "DELIVERED").length;
  return {
    revenue,
    paidCount: paidOrders.length,
    averagePaidOrder: paidOrders.length ? revenue / paidOrders.length : null,
    completionRate: periodOrders.length ? delivered / periodOrders.length : null,
    totalOrders: periodOrders.length
  };
}

export function dashboardAnalytics(orders, now = new Date()) {
  const end = new Date(utcDay(now).getTime() + DAY_MS);
  const currentStart = new Date(end.getTime() - 30 * DAY_MS);
  const previousStart = new Date(currentStart.getTime() - 30 * DAY_MS);
  const current = summarizeOrders(orders, currentStart, end);
  const previous = summarizeOrders(orders, previousStart, currentStart);
  const series = Array.from({ length: 30 }, (_, index) => {
    const start = new Date(currentStart.getTime() + index * DAY_MS);
    const dayEnd = new Date(start.getTime() + DAY_MS);
    const revenue = (orders || [])
      .filter((order) => order.paymentStatus === "PAID" && inPeriod(order, start, dayEnd))
      .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    return { date: start, revenue };
  });
  return {
    current,
    previous,
    changes: {
      revenue: percentageChange(current.revenue, previous.revenue),
      paidCount: percentageChange(current.paidCount, previous.paidCount),
      averagePaidOrder: percentageChange(
        current.averagePaidOrder ?? 0,
        previous.averagePaidOrder ?? 0
      ),
      completionRate: percentageChange(
        current.completionRate ?? 0,
        previous.completionRate ?? 0
      )
    },
    series
  };
}

export function chartPoints(series, width = 480, height = 160) {
  const max = Math.max(...series.map((item) => item.revenue), 1);
  return series.map((item, index) => ({
    ...item,
    x: series.length === 1 ? 0 : (index / (series.length - 1)) * width,
    y: height - (item.revenue / max) * height
  }));
}

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import OrderDetailPage from "./orders/OrderDetailPage.jsx";
import PromotionPage from "./promotions/PromotionPage.jsx";
import CategoryPage from "./categories/CategoryPage.jsx";
import { adminApi } from "../services/api/adminApi.js";

vi.mock("../services/api/adminApi.js", () => ({
  adminApi: {
    getOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    updateOrderTracking: vi.fn(),
    listOrderTrackingEvents: vi.fn().mockResolvedValue([]),
    createOrderTrackingEvent: vi.fn(),
    getOrderReturnRequest: vi.fn(),
    listRefunds: vi.fn().mockResolvedValue([]),
    cancelOrder: vi.fn(),
    approveReturnRequest: vi.fn(),
    rejectReturnRequest: vi.fn(),
    receiveReturnRequest: vi.fn(),
    createRefund: vi.fn(),
    listCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deactivateCategory: vi.fn(),
    activateCategory: vi.fn(),
    listPromotionsPage: vi.fn(),
    listProducts: vi.fn(),
    createPromotion: vi.fn(),
    updatePromotion: vi.fn(),
    deletePromotion: vi.fn()
  }
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderRoute(element, route, pattern) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } }
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <Routes><Route path={pattern} element={element} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("admin pages with current backend response fields", () => {
  it("loads categories from the supported admin endpoint", async () => {
    adminApi.listCategories.mockResolvedValue([
      { id: "category-1", name: "Áo", slug: "ao", active: true }
    ]);

    renderRoute(<CategoryPage />, "/categories", "/categories");

    expect((await screen.findAllByText("Áo")).length).toBeGreaterThanOrEqual(1);
    expect(adminApi.listCategories).toHaveBeenCalledTimes(1);
  });

  it("shows order notes, cost breakdown and tracking controls", async () => {
    adminApi.getOrder.mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      subtotalAmount: 500000,
      discountAmount: 50000,
      loyaltyCoinsUsed: 10,
      loyaltyDiscountAmount: 10000,
      shippingFee: 30000,
      giftWrapFee: 20000,
      totalAmount: 490000,
      status: "PROCESSING",
      paymentMethod: "VNPAY",
      paymentStatus: "PAID",
      shippingAddress: "Quận 1, TP.HCM",
      shippingPhone: "0900000000",
      note: "Giao giờ hành chính",
      voucherCode: "LYRA10",
      giftWrap: true,
      giftMessage: "Chúc mừng sinh nhật",
      shippingCarrier: "GHN",
      trackingCode: "GHN-123",
      trackingUrl: "https://example.test/GHN-123",
      createdAt: "2026-09-28T01:00:00Z",
      items: []
    });

    renderRoute(<OrderDetailPage />, "/orders/11111111-1111-1111-1111-111111111111", "/orders/:id");

    expect(await screen.findByText("Giao giờ hành chính")).toBeTruthy();
    expect(screen.getByText("Đã thanh toán").parentElement.textContent).toContain("VNPay");
    expect(screen.getByLabelText("Mã vận đơn").value).toBe("GHN-123");
    expect(screen.getByText("LYRA10")).toBeTruthy();
  });

  it("renders promotions and their selected products", async () => {
    adminApi.listProducts.mockResolvedValue([
      { id: "p1", name: "Áo Lyra", active: true }
    ]);
    adminApi.listPromotionsPage.mockResolvedValue({ content: [
      {
        id: "sale-1",
        title: "Flash sale",
        description: "Cuối tuần",
        discountPercent: 20,
        startsAt: "2026-09-28T01:00:00Z",
        endsAt: "2026-09-30T01:00:00Z",
        active: true,
        items: [{ productId: "p1", salePrice: 400000 }]
      }
    ], page: 0, size: 10, totalElements: 1, totalPages: 1 });

    renderRoute(<PromotionPage />, "/promotions", "/promotions");

    expect(await screen.findByText("Flash sale")).toBeTruthy();
    expect(screen.getAllByText(/Áo Lyra/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Bật")).toBeTruthy();
  });

  it("explains why a promotion cannot be saved instead of failing silently", async () => {
    adminApi.listProducts.mockResolvedValue([{ id: "p1", name: "Áo Lyra", active: true }]);
    adminApi.listPromotionsPage.mockResolvedValue({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });

    renderRoute(<PromotionPage />, "/promotions", "/promotions");
    await screen.findByText("Áo Lyra");
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    expect(await screen.findByText("Vui lòng nhập tên khuyến mãi")).toBeTruthy();
    expect(screen.getByText("Vui lòng chọn thời gian bắt đầu")).toBeTruthy();
    expect(screen.getByText("Vui lòng chọn thời gian kết thúc")).toBeTruthy();
    expect(screen.getByText("Vui lòng chọn ít nhất một sản phẩm")).toBeTruthy();
    expect(adminApi.createPromotion).not.toHaveBeenCalled();
  });

  it("submits an edited promotion", async () => {
    adminApi.listProducts.mockResolvedValue([{ id: "p1", name: "Áo Lyra", active: true }]);
    adminApi.listPromotionsPage.mockResolvedValue({ content: [{
      id: "sale-1",
      title: "Flash sale",
      description: "Cuối tuần",
      discountPercent: 20,
      startsAt: "2026-09-28T01:00:00Z",
      endsAt: "2026-09-30T01:00:00Z",
      active: true,
      items: [{ productId: "p1", salePrice: 400000 }]
    }], page: 0, size: 10, totalElements: 1, totalPages: 1 });
    adminApi.updatePromotion.mockResolvedValue({ id: "sale-1" });

    renderRoute(<PromotionPage />, "/promotions", "/promotions");
    await screen.findByText("Flash sale");
    fireEvent.click(screen.getByRole("button", { name: "Sửa" }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(adminApi.updatePromotion).toHaveBeenCalledWith(
      "sale-1",
      expect.objectContaining({ name: "Flash sale", productIds: ["p1"] })
    ));
  });
});

import { describe, expect, it } from "vitest";
import {
  adminEndpoints,
  authEndpoints,
  createCategoryBody,
  createProductBody,
  createProductImageBody,
  updateProductImageBody,
  createVariantBody,
  cancelOrderBody,
  loginBody,
  nextOrderStatus,
  refundOrderBody,
  returnDecisionBody,
  promotionBody,
  publicEndpoints,
  updateOrderStatusBody,
  updateOrderTrackingBody,
  trackingEventBody,
  updateProductBody,
  updateUserRoleBody,
  updateUserStatusBody,
  updateVariantBody,
  voucherBody
} from "./endpoints.js";

describe("auth and admin endpoint mapping", () => {
  it("uses the real auth contract paths", () => {
    expect(authEndpoints()).toEqual({
      login: { method: "POST", path: "/api/v1/auth/login" },
      csrf: { method: "GET", path: "/api/v1/auth/csrf" },
      refresh: { method: "POST", path: "/api/v1/auth/refresh" },
      logout: { method: "POST", path: "/api/v1/auth/logout" }
    });
  });

  it("maps dashboard products categories orders users reviews to admin APIs", () => {
    const admin = adminEndpoints();
    expect(admin.dashboard).toEqual({ method: "GET", path: "/api/v1/admin/dashboard" });
    expect(admin.search).toEqual({ method: "GET", path: "/api/v1/admin/search" });
    expect(admin.products).toEqual({ method: "GET", path: "/api/v1/admin/products" });
    expect(admin.product("p1")).toEqual({ method: "GET", path: "/api/v1/admin/products/p1" });
    expect(admin.createProduct).toEqual({ method: "POST", path: "/api/v1/admin/products" });
    expect(admin.updateProduct("p1")).toEqual({ method: "PUT", path: "/api/v1/admin/products/p1" });
    expect(admin.categories).toEqual({ method: "GET", path: "/api/v1/admin/categories" });
    expect(admin.activateProduct("p1")).toEqual({
      method: "PATCH",
      path: "/api/v1/admin/products/p1/activate"
    });
    expect(admin.deactivateProduct("p1")).toEqual({
      method: "PATCH",
      path: "/api/v1/admin/products/p1/deactivate"
    });
    expect(admin.createCategory).toEqual({ method: "POST", path: "/api/v1/admin/categories" });
    expect(admin.updateCategory(9)).toEqual({ method: "PUT", path: "/api/v1/admin/categories/9" });
    expect(admin.deactivateCategory(9)).toEqual({
      method: "PATCH",
      path: "/api/v1/admin/categories/9/deactivate"
    });
    expect(admin.activateCategory(9)).toEqual({
      method: "PATCH",
      path: "/api/v1/admin/categories/9/activate"
    });
    expect(admin.orders).toEqual({ method: "GET", path: "/api/v1/admin/orders" });
    expect(admin.order("o1")).toEqual({ method: "GET", path: "/api/v1/admin/orders/o1" });
    expect(admin.updateOrderStatus("o1")).toEqual({
      method: "PUT",
      path: "/api/v1/admin/orders/o1/status"
    });
    expect(admin.cancelOrder("o1")).toEqual({ method: "PUT", path: "/api/v1/admin/orders/o1/cancel" });
    expect(admin.returnRequests).toEqual({ method: "GET", path: "/api/v1/admin/orders/return-requests" });
    expect(admin.approveReturnRequest("o1")).toEqual({ method: "PUT", path: "/api/v1/admin/orders/o1/return-request/approve" });
    expect(admin.createRefund("o1")).toEqual({ method: "POST", path: "/api/v1/admin/orders/o1/refunds" });
    expect(admin.updateOrderTracking("o1")).toEqual({
      method: "PUT",
      path: "/api/v1/admin/orders/o1/tracking"
    });
    expect(admin.orderTrackingEvents("o1")).toEqual({
      method: "GET",
      path: "/api/v1/admin/orders/o1/tracking-events"
    });
    expect(admin.createOrderTrackingEvent("o1")).toEqual({
      method: "POST",
      path: "/api/v1/admin/orders/o1/tracking-events"
    });
    expect(admin.users).toEqual({ method: "GET", path: "/api/v1/admin/users" });
    expect(admin.updateUserStatus("u1")).toEqual({
      method: "PUT",
      path: "/api/v1/admin/users/u1/status"
    });
    expect(admin.updateUserRole("u1")).toEqual({
      method: "PUT",
      path: "/api/v1/admin/users/u1/role"
    });
    expect(admin.reviews).toEqual({ method: "GET", path: "/api/v1/admin/reviews" });
    expect(admin.deleteReview(3)).toEqual({ method: "DELETE", path: "/api/v1/admin/reviews/3" });
    expect(admin.promotions).toEqual({ method: "GET", path: "/api/v1/admin/promotions" });
    expect(admin.createPromotion).toEqual({ method: "POST", path: "/api/v1/admin/promotions" });
    expect(admin.updatePromotion("sale-1")).toEqual({ method: "PUT", path: "/api/v1/admin/promotions/sale-1" });
    expect(admin.deletePromotion("sale-1")).toEqual({ method: "DELETE", path: "/api/v1/admin/promotions/sale-1" });
    expect(admin.updateVariant("p1", "v1")).toEqual({
      method: "PUT",
      path: "/api/v1/admin/products/p1/variants/v1"
    });
    expect(admin.activateVariant("p1", "v1")).toEqual({
      method: "PATCH",
      path: "/api/v1/admin/products/p1/variants/v1/activate"
    });
    expect(admin.updateProductImage("p1", 7)).toEqual({ method: "PUT", path: "/api/v1/admin/products/p1/images/7" });
    expect(admin.deleteProductImage("p1", 7)).toEqual({ method: "DELETE", path: "/api/v1/admin/products/p1/images/7" });
    expect(admin.inventoryAdjustments("p1")).toEqual({ method: "GET", path: "/api/v1/admin/products/p1/variants/inventory-adjustments" });
    expect(admin.vouchers).toEqual({ method: "GET", path: "/api/v1/admin/vouchers" });
    expect(admin.auditLogs).toEqual({ method: "GET", path: "/api/v1/admin/audit-logs" });
    expect(admin.auditLogs).toEqual({ method: "GET", path: "/api/v1/admin/audit-logs" });
    expect(publicEndpoints().categories).toEqual({ method: "GET", path: "/api/v1/categories" });
    expect(publicEndpoints().product("p1")).toEqual({
      method: "GET",
      path: "/api/v1/products/p1"
    });
    expect(publicEndpoints().productReviews("p1")).toEqual({
      method: "GET",
      path: "/api/v1/products/p1/reviews"
    });
  });

  it("omits unknown JSON fields on write bodies", () => {
    expect(loginBody({
      email: " Admin@Shop.vn ",
      password: "secret-password",
      role: "ADMIN",
      extra: true
    })).toEqual({
      email: "Admin@Shop.vn",
      password: "secret-password"
    });

    expect(createProductBody({
      name: " Ao thun ",
      slug: "Ao-Thun",
      description: "cotton",
      basePrice: 199000,
      categoryId: "4",
      version: 2,
      active: true,
      id: "nope"
    })).toEqual({
      name: "Ao thun",
      slug: "ao-thun",
      basePrice: 199000,
      categoryId: 4,
      description: "cotton"
    });

    expect(createCategoryBody({
      name: "Ao",
      slug: "ao",
      parentId: "",
      unknown: "x"
    })).toEqual({
      name: "Ao",
      slug: "ao"
    });

    expect(updateOrderStatusBody(" CONFIRMED ")).toEqual({ status: "CONFIRMED" });
    expect(cancelOrderBody(" Khách yêu cầu ")).toEqual({ reason: "Khách yêu cầu" });
    expect(returnDecisionBody(" Đã kiểm tra ")).toEqual({ note: "Đã kiểm tra" });
    expect(returnDecisionBody(" ")).toEqual({});
    expect(refundOrderBody({ amount: "125000", reference: " RF-001 ", note: " Chuyển khoản " }))
      .toEqual({ amount: 125000, reference: "RF-001", note: "Chuyển khoản" });
    expect(updateOrderTrackingBody({
      carrier: " GHN ",
      trackingCode: " GHN-123 ",
      trackingUrl: " https://example.test/GHN-123 ",
      estimatedDeliveryAt: "2026-09-30T15:30"
    })).toEqual({
      carrier: "GHN",
      trackingCode: "GHN-123",
      trackingUrl: "https://example.test/GHN-123",
      estimatedDeliveryAt: new Date("2026-09-30T15:30").toISOString()
    });
    expect(trackingEventBody({
      status: " IN_TRANSIT ",
      description: " Đang trung chuyển ",
      location: " TP.HCM ",
      occurredAt: "2026-09-28T08:00"
    })).toEqual({
      status: "IN_TRANSIT",
      description: "Đang trung chuyển",
      location: "TP.HCM",
      occurredAt: new Date("2026-09-28T08:00").toISOString()
    });
    expect(updateUserStatusBody(1)).toEqual({ active: true });
    expect(updateUserRoleBody(" ADMIN ")).toEqual({ role: "ADMIN" });
    expect(updateProductBody({
      name: " Ao ",
      slug: "Ao-Thun",
      description: "cotton",
      basePrice: 199000,
      categoryId: "4",
      version: "2",
      extra: true
    })).toEqual({
      name: "Ao",
      slug: "ao-thun",
      description: "cotton",
      basePrice: 199000,
      categoryId: 4,
      version: 2
    });
    expect(updateVariantBody({
      sku: "SKU-1",
      size: "M",
      color: "Black",
      price: 10,
      version: "3",
      stock: 9
    })).toEqual({
      sku: "SKU-1",
      size: "M",
      color: "Black",
      price: 10,
      version: 3
    });
    expect(createVariantBody({
      sku: "SKU-1",
      size: "M",
      color: "Black",
      price: 10,
      stock: 3,
      extra: 1
    })).toEqual({
      sku: "SKU-1",
      size: "M",
      color: "Black",
      price: 10,
      stock: 3
    });
    expect(createProductImageBody({
      url: " https://cdn.example/a.jpg ",
      primary: true,
      sortOrder: "2",
      mime: "image/jpeg"
    })).toEqual({
      url: "https://cdn.example/a.jpg",
      primary: true,
      sortOrder: 2
    });
    expect(updateProductImageBody({ primary: true, sortOrder: "3", variantId: "v1" }))
      .toEqual({ primary: true, sortOrder: 3, variantId: "v1" });
    expect(promotionBody({
      name: " Flash sale ",
      description: " Cuối tuần ",
      discountPercent: "20",
      startsAt: "2026-09-28T08:00",
      endsAt: "2026-09-30T23:00",
      active: true,
      productIds: ["p1", "p1", "p2"]
    })).toEqual({
      name: "Flash sale",
      description: "Cuối tuần",
      discountPercent: 20,
      startsAt: new Date("2026-09-28T08:00").toISOString(),
      endsAt: new Date("2026-09-30T23:00").toISOString(),
      active: true,
      productIds: ["p1", "p2"]
    });
    expect(voucherBody({ code: " lyra20 ", label: " Giảm 20% ", type: "discount", discountType: "PERCENT", discountValue: "20", maxDiscountAmount: "100000", minimumOrderAmount: "500000", startsAt: "2026-10-01T00:00", endsAt: "2026-10-31T23:59", totalUsageLimit: "100", perUserLimit: "1", active: true })).toEqual({ code: "LYRA20", label: "Giảm 20%", type: "discount", discountType: "PERCENT", discountValue: 20, maxDiscountAmount: 100000, minimumOrderAmount: 500000, startsAt: new Date("2026-10-01T00:00").toISOString(), endsAt: new Date("2026-10-31T23:59").toISOString(), totalUsageLimit: 100, perUserLimit: 1, active: true });
  });

  it("only allows the linear order status walk", () => {
    expect(nextOrderStatus("PENDING")).toBe("CONFIRMED");
    expect(nextOrderStatus("CONFIRMED")).toBe("PROCESSING");
    expect(nextOrderStatus("PROCESSING")).toBe("SHIPPING");
    expect(nextOrderStatus("SHIPPING")).toBe("DELIVERED");
    expect(nextOrderStatus("DELIVERED")).toBeNull();
    expect(nextOrderStatus("CANCELLED")).toBeNull();
  });
});

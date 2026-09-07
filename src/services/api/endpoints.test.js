import { describe, expect, it } from "vitest";
import {
  adminEndpoints,
  authEndpoints,
  createCategoryBody,
  createProductBody,
  createProductImageBody,
  createVariantBody,
  loginBody,
  nextOrderStatus,
  publicEndpoints,
  updateOrderStatusBody,
  updateUserStatusBody
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
    expect(admin.products).toEqual({ method: "GET", path: "/api/v1/admin/products" });
    expect(admin.createProduct).toEqual({ method: "POST", path: "/api/v1/admin/products" });
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
    expect(admin.orders).toEqual({ method: "GET", path: "/api/v1/admin/orders" });
    expect(admin.order("o1")).toEqual({ method: "GET", path: "/api/v1/admin/orders/o1" });
    expect(admin.updateOrderStatus("o1")).toEqual({
      method: "PUT",
      path: "/api/v1/admin/orders/o1/status"
    });
    expect(admin.users).toEqual({ method: "GET", path: "/api/v1/admin/users" });
    expect(admin.updateUserStatus("u1")).toEqual({
      method: "PUT",
      path: "/api/v1/admin/users/u1/status"
    });
    expect(admin.reviews).toEqual({ method: "GET", path: "/api/v1/admin/reviews" });
    expect(admin.deleteReview(3)).toEqual({ method: "DELETE", path: "/api/v1/admin/reviews/3" });
    expect(publicEndpoints().categories).toEqual({ method: "GET", path: "/api/v1/categories" });
    expect(publicEndpoints().product("p1")).toEqual({
      method: "GET",
      path: "/api/v1/products/p1"
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
    expect(updateUserStatusBody(1)).toEqual({ active: true });
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

function optionalText(value) {
  if (value == null) {
    return undefined;
  }
  const text = String(value).trim();
  return text === "" ? undefined : text;
}

function optionalPositiveId(value) {
  if (value == null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}

export function loginBody(input) {
  return {
    email: String(input.email).trim(),
    password: input.password
  };
}

export function createProductBody(input) {
  const body = {
    name: String(input.name).trim(),
    slug: String(input.slug).trim().toLowerCase(),
    basePrice: input.basePrice,
    categoryId: Number(input.categoryId)
  };
  const description = optionalText(input.description);
  if (description !== undefined) {
    body.description = description;
  }
  return body;
}

export function createCategoryBody(input) {
  const body = {
    name: String(input.name).trim(),
    slug: String(input.slug).trim().toLowerCase()
  };
  const description = optionalText(input.description);
  if (description !== undefined) {
    body.description = description;
  }
  const parentId = optionalPositiveId(input.parentId);
  if (parentId !== undefined) {
    body.parentId = parentId;
  }
  return body;
}

export function updateCategoryBody(input) {
  return createCategoryBody(input);
}

export function updateOrderStatusBody(status) {
  return { status: String(status).trim() };
}

export function cancelOrderBody(reason) {
  return { reason: String(reason).trim() };
}

export function returnDecisionBody(note) {
  const value = optionalText(note);
  return value === undefined ? {} : { note: value };
}

export function refundOrderBody(input) {
  const body = {
    amount: Number(input.amount),
    reference: String(input.reference).trim()
  };
  const note = optionalText(input.note);
  if (note !== undefined) body.note = note;
  return body;
}

export function updateOrderTrackingBody(input) {
  const body = {
    carrier: String(input.carrier).trim(),
    trackingCode: String(input.trackingCode).trim()
  };
  const trackingUrl = optionalText(input.trackingUrl);
  if (trackingUrl !== undefined) {
    body.trackingUrl = trackingUrl;
  }
  if (input.estimatedDeliveryAt) {
    body.estimatedDeliveryAt = new Date(input.estimatedDeliveryAt).toISOString();
  }
  return body;
}

export function trackingEventBody(input) {
  const body = {
    status: String(input.status).trim(),
    description: String(input.description).trim(),
    occurredAt: new Date(input.occurredAt).toISOString()
  };
  const location = optionalText(input.location);
  if (location !== undefined) {
    body.location = location;
  }
  return body;
}

export function updateUserStatusBody(active) {
  return { active: Boolean(active) };
}

export function updateUserRoleBody(role) {
  return { role: String(role).trim() };
}

export function updateProductBody(input) {
  const body = {
    name: String(input.name).trim(),
    slug: String(input.slug).trim().toLowerCase(),
    basePrice: input.basePrice,
    categoryId: Number(input.categoryId),
    version: Number(input.version)
  };
  const description = optionalText(input.description);
  if (description !== undefined) {
    body.description = description;
  }
  return body;
}

export function updateVariantBody(input) {
  return {
    sku: String(input.sku).trim(),
    size: String(input.size).trim(),
    color: String(input.color).trim(),
    price: input.price,
    version: Number(input.version)
  };
}

export function createVariantBody(input) {
  return {
    sku: String(input.sku).trim(),
    size: String(input.size).trim(),
    color: String(input.color).trim(),
    price: input.price,
    stock: Number(input.stock)
  };
}

export function adjustInventoryBody(input) {
  return {
    stock: Number(input.stock),
    version: Number(input.version),
    reason: String(input.reason).trim()
  };
}

export function createProductImageBody(input) {
  const body = {
    url: String(input.url).trim(),
    primary: Boolean(input.primary),
    sortOrder: Number(input.sortOrder)
  };
  if (input.variantId) {
    body.variantId = input.variantId;
  }
  return body;
}

export function updateProductImageBody(input) {
  const body = { primary: Boolean(input.primary), sortOrder: Number(input.sortOrder) };
  if (input.variantId) body.variantId = input.variantId;
  return body;
}

export function promotionBody(input) {
  return {
    name: String(input.name).trim(),
    description: optionalText(input.description),
    discountPercent: Number(input.discountPercent),
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString(),
    active: Boolean(input.active),
    productIds: Array.from(new Set((input.productIds || []).map(String)))
  };
}

export function voucherBody(input) {
  return {
    code: String(input.code).trim().toUpperCase(), label: String(input.label).trim(),
    type: input.type, discountType: input.discountType, discountValue: Number(input.discountValue),
    maxDiscountAmount: input.maxDiscountAmount === "" || input.maxDiscountAmount == null ? null : Number(input.maxDiscountAmount),
    minimumOrderAmount: Number(input.minimumOrderAmount), startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString(), totalUsageLimit: input.totalUsageLimit === "" || input.totalUsageLimit == null ? null : Number(input.totalUsageLimit),
    perUserLimit: Number(input.perUserLimit), active: Boolean(input.active)
  };
}

export const ORDER_STATUS_SEQUENCE = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED"
];

export function nextOrderStatus(current) {
  const index = ORDER_STATUS_SEQUENCE.indexOf(current);
  if (index < 0 || index >= ORDER_STATUS_SEQUENCE.length - 1) {
    return null;
  }
  return ORDER_STATUS_SEQUENCE[index + 1];
}

export function authEndpoints() {
  return {
    login: { method: "POST", path: "/api/v1/auth/login" },
    csrf: { method: "GET", path: "/api/v1/auth/csrf" },
    refresh: { method: "POST", path: "/api/v1/auth/refresh" },
    logout: { method: "POST", path: "/api/v1/auth/logout" }
  };
}

export function adminEndpoints() {
  return {
    dashboard: { method: "GET", path: "/api/v1/admin/dashboard" },
    notifications: { method: "GET", path: "/api/v1/admin/notifications" },
    readNotification: (key) => ({ method: "PUT", path: `/api/v1/admin/notifications/${encodeURIComponent(key)}/read` }),
    readAllNotifications: { method: "PUT", path: "/api/v1/admin/notifications/read-all" },
    search: { method: "GET", path: "/api/v1/admin/search" },
    products: { method: "GET", path: "/api/v1/admin/products" },
    productsPage: { method: "GET", path: "/api/v1/admin/products/page" },
    product: (id) => ({ method: "GET", path: `/api/v1/admin/products/${id}` }),
    createProduct: { method: "POST", path: "/api/v1/admin/products" },
    updateProduct: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/products/${id}`
    }),
    activateProduct: (id) => ({
      method: "PATCH",
      path: `/api/v1/admin/products/${id}/activate`
    }),
    deactivateProduct: (id) => ({
      method: "PATCH",
      path: `/api/v1/admin/products/${id}/deactivate`
    }),
    categories: { method: "GET", path: "/api/v1/admin/categories" },
    categoriesPage: { method: "GET", path: "/api/v1/admin/categories/page" },
    createCategory: { method: "POST", path: "/api/v1/admin/categories" },
    updateCategory: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/categories/${id}`
    }),
    deactivateCategory: (id) => ({
      method: "PATCH",
      path: `/api/v1/admin/categories/${id}/deactivate`
    }),
    activateCategory: (id) => ({
      method: "PATCH",
      path: `/api/v1/admin/categories/${id}/activate`
    }),
    orders: { method: "GET", path: "/api/v1/admin/orders" },
    ordersPage: { method: "GET", path: "/api/v1/admin/orders/page" },
    order: (id) => ({ method: "GET", path: `/api/v1/admin/orders/${id}` }),
    updateOrderStatus: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/orders/${id}/status`
    }),
    cancelOrder: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/orders/${id}/cancel`
    }),
    returnRequests: { method: "GET", path: "/api/v1/admin/orders/return-requests" },
    returnRequestsPage: { method: "GET", path: "/api/v1/admin/orders/return-requests/page" },
    orderReturnRequest: (id) => ({
      method: "GET",
      path: `/api/v1/admin/orders/${id}/return-request`
    }),
    approveReturnRequest: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/orders/${id}/return-request/approve`
    }),
    rejectReturnRequest: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/orders/${id}/return-request/reject`
    }),
    receiveReturnRequest: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/orders/${id}/return-request/receive`
    }),
    refunds: (id) => ({
      method: "GET",
      path: `/api/v1/admin/orders/${id}/refunds`
    }),
    createRefund: (id) => ({
      method: "POST",
      path: `/api/v1/admin/orders/${id}/refunds`
    }),
    updateOrderTracking: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/orders/${id}/tracking`
    }),
    orderTrackingEvents: (id) => ({
      method: "GET",
      path: `/api/v1/admin/orders/${id}/tracking-events`
    }),
    createOrderTrackingEvent: (id) => ({
      method: "POST",
      path: `/api/v1/admin/orders/${id}/tracking-events`
    }),
    users: { method: "GET", path: "/api/v1/admin/users" },
    usersPage: { method: "GET", path: "/api/v1/admin/users/page" },
    user: (id) => ({ method: "GET", path: `/api/v1/admin/users/${id}` }),
    addUserSupportNote: (id) => ({ method: "POST", path: `/api/v1/admin/users/${id}/support-notes` }),
    updateUserStatus: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/users/${id}/status`
    }),
    updateUserRole: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/users/${id}/role`
    }),
    reviews: { method: "GET", path: "/api/v1/admin/reviews" },
    reviewsPage: { method: "GET", path: "/api/v1/admin/reviews/page" },
    deleteReview: (id) => ({
      method: "DELETE",
      path: `/api/v1/admin/reviews/${id}`
    }),
    moderateReview: (id) => ({ method: "PUT", path: `/api/v1/admin/reviews/${id}/moderation` }),
    promotions: { method: "GET", path: "/api/v1/admin/promotions" },
    promotionsPage: { method: "GET", path: "/api/v1/admin/promotions/page" },
    createPromotion: { method: "POST", path: "/api/v1/admin/promotions" },
    updatePromotion: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/promotions/${id}`
    }),
    deletePromotion: (id) => ({
      method: "DELETE",
      path: `/api/v1/admin/promotions/${id}`
    }),
    vouchers: { method: "GET", path: "/api/v1/admin/vouchers" },
    vouchersPage: { method: "GET", path: "/api/v1/admin/vouchers/page" },
    createVoucher: { method: "POST", path: "/api/v1/admin/vouchers" },
    updateVoucher: (id) => ({ method: "PUT", path: `/api/v1/admin/vouchers/${id}` }),
    deleteVoucher: (id) => ({ method: "DELETE", path: `/api/v1/admin/vouchers/${id}` }),
    auditLogs: { method: "GET", path: "/api/v1/admin/audit-logs" },
    auditLogsPage: { method: "GET", path: "/api/v1/admin/audit-logs/page" },
    createVariant: (productId) => ({
      method: "POST",
      path: `/api/v1/admin/products/${productId}/variants`
    }),
    updateVariant: (productId, variantId) => ({
      method: "PUT",
      path: `/api/v1/admin/products/${productId}/variants/${variantId}`
    }),
    deactivateVariant: (productId, variantId) => ({
      method: "PATCH",
      path: `/api/v1/admin/products/${productId}/variants/${variantId}/deactivate`
    }),
    activateVariant: (productId, variantId) => ({
      method: "PATCH",
      path: `/api/v1/admin/products/${productId}/variants/${variantId}/activate`
    }),
    adjustInventory: (productId, variantId) => ({
      method: "PATCH",
      path: `/api/v1/admin/products/${productId}/variants/${variantId}/inventory`
    }),
    inventoryAdjustments: (productId) => ({
      method: "GET",
      path: `/api/v1/admin/products/${productId}/variants/inventory-adjustments`
    }),
    createProductImage: (productId) => ({
      method: "POST",
      path: `/api/v1/admin/products/${productId}/images`
    }),
    updateProductImage: (productId, imageId) => ({
      method: "PUT",
      path: `/api/v1/admin/products/${productId}/images/${imageId}`
    }),
    deleteProductImage: (productId, imageId) => ({
      method: "DELETE",
      path: `/api/v1/admin/products/${productId}/images/${imageId}`
    })
  };
}

export function publicEndpoints() {
  return {
    categories: { method: "GET", path: "/api/v1/categories" },
    product: (id) => ({ method: "GET", path: `/api/v1/products/${id}` }),
    productReviews: (id) => ({ method: "GET", path: `/api/v1/products/${id}/reviews` })
  };
}

export function buildWriteRequest(endpoint, body) {
  return {
    method: endpoint.method,
    path: endpoint.path,
    body
  };
}

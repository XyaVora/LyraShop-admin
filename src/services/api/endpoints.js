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
    version: Number(input.version)
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
    products: { method: "GET", path: "/api/v1/admin/products" },
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
    order: (id) => ({ method: "GET", path: `/api/v1/admin/orders/${id}` }),
    updateOrderStatus: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/orders/${id}/status`
    }),
    users: { method: "GET", path: "/api/v1/admin/users" },
    updateUserStatus: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/users/${id}/status`
    }),
    updateUserRole: (id) => ({
      method: "PUT",
      path: `/api/v1/admin/users/${id}/role`
    }),
    reviews: { method: "GET", path: "/api/v1/admin/reviews" },
    deleteReview: (id) => ({
      method: "DELETE",
      path: `/api/v1/admin/reviews/${id}`
    }),
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
    createProductImage: (productId) => ({
      method: "POST",
      path: `/api/v1/admin/products/${productId}/images`
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

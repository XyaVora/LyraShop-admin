import { api, requestEndpoint } from "./client.js";
import {
  adjustInventoryBody,
  cancelOrderBody,
  adminEndpoints,
  createCategoryBody,
  createProductBody,
  createProductImageBody,
  updateProductImageBody,
  promotionBody,
  createVariantBody,
  publicEndpoints,
  updateCategoryBody,
  updateOrderStatusBody,
  updateOrderTrackingBody,
  trackingEventBody,
  refundOrderBody,
  returnDecisionBody,
  updateProductBody,
  updateUserRoleBody,
  updateUserStatusBody,
  updateVariantBody,
  voucherBody
} from "./endpoints.js";

const admin = adminEndpoints();
const published = publicEndpoints();

export const adminApi = {
  dashboard() {
    return requestEndpoint(admin.dashboard).then((res) => res.data);
  },
  listNotifications() {
    return requestEndpoint(admin.notifications).then((res) => res.data);
  },
  readNotification(key) {
    return requestEndpoint(admin.readNotification(key)).then((res) => res.data);
  },
  readAllNotifications() {
    return requestEndpoint(admin.readAllNotifications).then((res) => res.data);
  },
  search(query) {
    return api.get(admin.search.path, { params: { q: query } }).then((res) => res.data);
  },
  listProducts() {
    return requestEndpoint(admin.products).then((res) => res.data);
  },
  listProductsPage(params) {
    return api.get(admin.productsPage.path, { params }).then((res) => res.data);
  },
  getProduct(id) {
    return requestEndpoint(admin.product(id)).then((res) => res.data);
  },
  createProduct(input) {
    return requestEndpoint(admin.createProduct, createProductBody(input)).then((res) => res.data);
  },
  updateProduct(id, input) {
    return requestEndpoint(admin.updateProduct(id), updateProductBody(input)).then((res) => res.data);
  },
  activateProduct(id) {
    return requestEndpoint(admin.activateProduct(id)).then((res) => res.data);
  },
  deactivateProduct(id) {
    return requestEndpoint(admin.deactivateProduct(id)).then((res) => res.data);
  },
  listCategories() {
    return requestEndpoint(admin.categories).then((res) => res.data);
  },
  listCategoriesPage(params) { return api.get(admin.categoriesPage.path, { params }).then((res) => res.data); },
  listPublicCategories() {
    return requestEndpoint(published.categories).then((res) => res.data);
  },
  getPublicProduct(id) {
    return requestEndpoint(published.product(id)).then((res) => res.data);
  },
  listProductReviews(id) {
    return requestEndpoint(published.productReviews(id)).then((res) => res.data);
  },
  createCategory(input) {
    return requestEndpoint(admin.createCategory, createCategoryBody(input)).then((res) => res.data);
  },
  updateCategory(id, input) {
    return requestEndpoint(admin.updateCategory(id), updateCategoryBody(input)).then((res) => res.data);
  },
  deactivateCategory(id) {
    return requestEndpoint(admin.deactivateCategory(id)).then((res) => res.data);
  },
  activateCategory(id) {
    return requestEndpoint(admin.activateCategory(id)).then((res) => res.data);
  },
  listOrders() {
    return requestEndpoint(admin.orders).then((res) => res.data);
  },
  listOrdersPage(params) {
    return api.get(admin.ordersPage.path, { params }).then((res) => res.data);
  },
  getOrder(id) {
    return requestEndpoint(admin.order(id)).then((res) => res.data);
  },
  updateOrderStatus(id, status) {
    return requestEndpoint(admin.updateOrderStatus(id), updateOrderStatusBody(status)).then((res) => res.data);
  },
  cancelOrder(id, reason) {
    return requestEndpoint(admin.cancelOrder(id), cancelOrderBody(reason)).then((res) => res.data);
  },
  listReturnRequests() {
    return requestEndpoint(admin.returnRequests).then((res) => res.data);
  },
  listReturnRequestsPage(params) { return api.get(admin.returnRequestsPage.path, { params }).then((res) => res.data); },
  getOrderReturnRequest(id) {
    return requestEndpoint(admin.orderReturnRequest(id)).then((res) => res.data);
  },
  approveReturnRequest(id, note) {
    return requestEndpoint(admin.approveReturnRequest(id), returnDecisionBody(note)).then((res) => res.data);
  },
  rejectReturnRequest(id, note) {
    return requestEndpoint(admin.rejectReturnRequest(id), returnDecisionBody(note)).then((res) => res.data);
  },
  receiveReturnRequest(id, note) {
    return requestEndpoint(admin.receiveReturnRequest(id), returnDecisionBody(note)).then((res) => res.data);
  },
  listRefunds(id) {
    return requestEndpoint(admin.refunds(id)).then((res) => res.data);
  },
  createRefund(id, input) {
    return requestEndpoint(admin.createRefund(id), refundOrderBody(input)).then((res) => res.data);
  },
  updateOrderTracking(id, input) {
    return requestEndpoint(admin.updateOrderTracking(id), updateOrderTrackingBody(input)).then((res) => res.data);
  },
  listOrderTrackingEvents(id) {
    return requestEndpoint(admin.orderTrackingEvents(id)).then((res) => res.data);
  },
  createOrderTrackingEvent(id, input) {
    return requestEndpoint(admin.createOrderTrackingEvent(id), trackingEventBody(input)).then((res) => res.data);
  },
  listUsers() {
    return requestEndpoint(admin.users).then((res) => res.data);
  },
  listUsersPage(params) {
    return api.get(admin.usersPage.path, { params }).then((res) => res.data);
  },
  getUser(id) {
    return requestEndpoint(admin.user(id)).then((res) => res.data);
  },
  addUserSupportNote(id, note) {
    return requestEndpoint(admin.addUserSupportNote(id), { note: String(note).trim() }).then((res) => res.data);
  },
  updateUserStatus(id, active) {
    return requestEndpoint(admin.updateUserStatus(id), updateUserStatusBody(active)).then((res) => res.data);
  },
  updateUserRole(id, role) {
    return requestEndpoint(admin.updateUserRole(id), updateUserRoleBody(role)).then((res) => res.data);
  },
  listReviews() {
    return requestEndpoint(admin.reviews).then((res) => res.data);
  },
  listReviewsPage(params) {
    return api.get(admin.reviewsPage.path, { params }).then((res) => res.data);
  },
  deleteReview(id) {
    return requestEndpoint(admin.deleteReview(id)).then((res) => res.data);
  },
  moderateReview(id, status, note) {
    return requestEndpoint(admin.moderateReview(id), { status, note }).then((res) => res.data);
  },
  listPromotions() {
    return requestEndpoint(admin.promotions).then((res) => res.data);
  },
  listPromotionsPage(params) { return api.get(admin.promotionsPage.path, { params }).then((res) => res.data); },
  createPromotion(input) {
    return requestEndpoint(admin.createPromotion, promotionBody(input)).then((res) => res.data);
  },
  updatePromotion(id, input) {
    return requestEndpoint(admin.updatePromotion(id), promotionBody(input)).then((res) => res.data);
  },
  deletePromotion(id) {
    return requestEndpoint(admin.deletePromotion(id)).then((res) => res.data);
  },
  listVouchers() { return requestEndpoint(admin.vouchers).then((res) => res.data); },
  listVouchersPage(params) { return api.get(admin.vouchersPage.path, { params }).then((res) => res.data); },
  createVoucher(input) { return requestEndpoint(admin.createVoucher, voucherBody(input)).then((res) => res.data); },
  updateVoucher(id, input) { return requestEndpoint(admin.updateVoucher(id), voucherBody(input)).then((res) => res.data); },
  deleteVoucher(id) { return requestEndpoint(admin.deleteVoucher(id)).then((res) => res.data); },
  listAuditLogs() { return requestEndpoint(admin.auditLogs).then((res) => res.data); },
  listAuditLogsPage(params) { return api.get(admin.auditLogsPage.path, { params }).then((res) => res.data); },
  createVariant(productId, input) {
    return requestEndpoint(admin.createVariant(productId), createVariantBody(input)).then((res) => res.data);
  },
  updateVariant(productId, variantId, input) {
    return requestEndpoint(
      admin.updateVariant(productId, variantId),
      updateVariantBody(input)
    ).then((res) => res.data);
  },
  deactivateVariant(productId, variantId) {
    return requestEndpoint(admin.deactivateVariant(productId, variantId)).then((res) => res.data);
  },
  activateVariant(productId, variantId) {
    return requestEndpoint(admin.activateVariant(productId, variantId)).then((res) => res.data);
  },
  adjustInventory(productId, variantId, input) {
    return requestEndpoint(
      admin.adjustInventory(productId, variantId),
      adjustInventoryBody(input)
    ).then((res) => res.data);
  },
  listInventoryAdjustments(productId) {
    return requestEndpoint(admin.inventoryAdjustments(productId)).then((res) => res.data);
  },
  createProductImage(productId, input) {
    return requestEndpoint(admin.createProductImage(productId), createProductImageBody(input))
      .then((res) => res.data);
  },
  updateProductImage(productId, imageId, input) {
    return requestEndpoint(admin.updateProductImage(productId, imageId), updateProductImageBody(input))
      .then((res) => res.data);
  },
  deleteProductImage(productId, imageId) {
    return requestEndpoint(admin.deleteProductImage(productId, imageId)).then((res) => res.data);
  },
  uploadProductImage(productId, file, input) {
    const form = new FormData();
    form.append("file", file);
    if (input.variantId) {
      form.append("variantId", input.variantId);
    }
    form.append("primary", String(Boolean(input.primary)));
    form.append("sortOrder", String(Number(input.sortOrder) || 0));
    return api.post(admin.createProductImage(productId).path, form).then((res) => res.data);
  }
};

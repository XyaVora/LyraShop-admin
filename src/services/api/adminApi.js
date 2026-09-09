import { requestEndpoint } from "./client.js";
import {
  adjustInventoryBody,
  adminEndpoints,
  createCategoryBody,
  createProductBody,
  createProductImageBody,
  createVariantBody,
  publicEndpoints,
  updateCategoryBody,
  updateOrderStatusBody,
  updateProductBody,
  updateUserRoleBody,
  updateUserStatusBody,
  updateVariantBody
} from "./endpoints.js";

const admin = adminEndpoints();
const published = publicEndpoints();

export const adminApi = {
  dashboard() {
    return requestEndpoint(admin.dashboard).then((res) => res.data);
  },
  listProducts() {
    return requestEndpoint(admin.products).then((res) => res.data);
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
  getOrder(id) {
    return requestEndpoint(admin.order(id)).then((res) => res.data);
  },
  updateOrderStatus(id, status) {
    return requestEndpoint(admin.updateOrderStatus(id), updateOrderStatusBody(status)).then((res) => res.data);
  },
  listUsers() {
    return requestEndpoint(admin.users).then((res) => res.data);
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
  deleteReview(id) {
    return requestEndpoint(admin.deleteReview(id)).then((res) => res.data);
  },
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
  createProductImage(productId, input) {
    return requestEndpoint(admin.createProductImage(productId), createProductImageBody(input))
      .then((res) => res.data);
  }
};

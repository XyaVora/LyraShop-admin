import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import OperatorNote from "../../components/common/OperatorNote.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import { parseApiError } from "../../services/api/errors.js";
import { activeClass } from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";
import { useEffect, useMemo, useState } from "react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [problem, setProblem] = useState(null);
  const [pendingReview, setPendingReview] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const pushToast = useToastStore((state) => state.push);

  const productQuery = useQuery({
    queryKey: ["admin", "products", id],
    queryFn: () => adminApi.getProduct(id)
  });
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: adminApi.listCategories
  });
  const reviewsQuery = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: adminApi.listReviews
  });
  const inventoryHistory = useQuery({
    queryKey: ["admin", "products", id, "inventory-adjustments"],
    queryFn: () => adminApi.listInventoryAdjustments(id)
  });

  const product = productQuery.data;
  const reviews = useMemo(
    () => (reviewsQuery.data || []).filter((row) => String(row.productId) === String(id)),
    [reviewsQuery.data, id]
  );

  const productForm = useForm({
    defaultValues: { name: "", slug: "", description: "", basePrice: 0, categoryId: "" }
  });
  const { reset: resetProductForm } = productForm;
  const variantForm = useForm({
    defaultValues: { sku: "", size: "", color: "", price: 0, stock: 0 }
  });
  const imageForm = useForm({
    defaultValues: { url: "", primary: false, sortOrder: 0, variantId: "" }
  });

  useEffect(() => {
    if (!productQuery.data) {
      return;
    }
    const detail = productQuery.data;
    resetProductForm({
      name: detail.name || "",
      slug: detail.slug || "",
      description: detail.description || "",
      basePrice: Number(detail.basePrice) || 0,
      categoryId: detail.categoryId ? String(detail.categoryId) : ""
    });
  }, [productQuery.data, resetProductForm]);

  function invalidateProduct() {
    queryClient.invalidateQueries({ queryKey: ["admin", "products", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  }

  const updateProduct = useMutation({
    mutationFn: (values) => adminApi.updateProduct(id, {
      ...values,
      version: product.version
    }),
    onSuccess: () => {
      invalidateProduct();
      pushToast("Đã cập nhật sản phẩm");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const createVariant = useMutation({
    mutationFn: (values) => adminApi.createVariant(id, values),
    onSuccess: () => {
      variantForm.reset();
      invalidateProduct();
      pushToast("Đã tạo biến thể");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const updateVariant = useMutation({
    mutationFn: ({ variantId, values }) => adminApi.updateVariant(id, variantId, values),
    onSuccess: () => {
      invalidateProduct();
      pushToast("Đã sửa biến thể");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const toggleVariant = useMutation({
    mutationFn: ({ variantId, active }) => (
      active ? adminApi.deactivateVariant(id, variantId) : adminApi.activateVariant(id, variantId)
    ),
    onSuccess: () => {
      invalidateProduct();
      pushToast("Đã cập nhật biến thể");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const adjust = useMutation({
    mutationFn: ({ variantId, stock, version, reason }) =>
      adminApi.adjustInventory(id, variantId, { stock, version, reason }),
    onSuccess: () => {
      invalidateProduct();
      queryClient.invalidateQueries({ queryKey: ["admin", "products", id, "inventory-adjustments"] });
      pushToast("Đã cập nhật tồn");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const createImage = useMutation({
    mutationFn: (values) => adminApi.createProductImage(id, {
      url: values.url,
      primary: values.primary,
      sortOrder: Number(values.sortOrder),
      variantId: values.variantId || undefined
    }),
    onSuccess: () => {
      imageForm.reset({ url: "", primary: false, sortOrder: 0, variantId: "" });
      invalidateProduct();
      pushToast("Đã thêm ảnh");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const uploadImage = useMutation({
    mutationFn: ({ file, values }) => adminApi.uploadProductImage(id, file, values),
    onSuccess: () => {
      invalidateProduct();
      pushToast("Đã tải ảnh lên");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const updateImage = useMutation({
    mutationFn: ({ imageId, values }) => adminApi.updateProductImage(id, imageId, values),
    onSuccess: () => {
      invalidateProduct();
      pushToast("Đã cập nhật ảnh");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const deleteImage = useMutation({
    mutationFn: (imageId) => adminApi.deleteProductImage(id, imageId),
    onSuccess: () => {
      invalidateProduct();
      pushToast("Đã xóa ảnh");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const deleteReview = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      pushToast("Đã xóa đánh giá");
    },
    onError: (error) => setProblem(parseApiError(error))
  });

  if (productQuery.isLoading) {
    return <SkeletonBlock rows={8} />;
  }
  if (productQuery.isError) {
    return <ErrorAlert error={productQuery.error} />;
  }
  if (!product) {
    return (
      <ErrorAlert
        problem={{
          status: 404,
          code: "PRODUCT_NOT_FOUND",
          message: "Không tìm thấy sản phẩm.",
          fieldErrors: {}
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={product.name}
        crumbs={[
          { label: "Tổng quan", to: "/" },
          { label: "Sản phẩm", to: "/products" },
          { label: product.name }
        ]}
        description={`${product.slug} · ${formatMoney(product.basePrice)} · version ${product.version}`}
        actions={(
          <StatusBadge
            className={activeClass(product.active)}
            label={product.active ? "Hiện" : "Ẩn"}
          />
        )}
      />
      <OperatorNote>
        Sửa sản phẩm và tồn kho cần version hiện tại. PUT sản phẩm không trả version mới nên trang tải lại chi tiết sau mỗi lần lưu.
      </OperatorNote>
      <ErrorAlert problem={problem} />

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h6">Sửa sản phẩm</h2>
          <form
            onSubmit={productForm.handleSubmit((values) => {
              setProblem(null);
              updateProduct.mutate(values);
            })}
          >
            <div className="row g-2">
              <div className="col-md-6">
                <input type="text" className="form-control" aria-label="Tên sản phẩm" placeholder="Tên" {...productForm.register("name", { required: true })} />
              </div>
              <div className="col-md-6">
                <input type="text" className="form-control" aria-label="Slug sản phẩm" placeholder="Slug" {...productForm.register("slug", { required: true })} />
              </div>
              <div className="col-md-4">
                <input className="form-control" aria-label="Giá cơ bản" type="number" step="0.01" {...productForm.register("basePrice", { valueAsNumber: true })} />
              </div>
              <div className="col-md-8">
                <select className="form-select" aria-label="Danh mục sản phẩm" {...productForm.register("categoryId", { required: true })}>
                  <option value="">Danh mục</option>
                  {(categories.data || []).filter((item) => item.active !== false).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <textarea className="form-control" aria-label="Mô tả sản phẩm" rows={2} placeholder="Mô tả" {...productForm.register("description")} />
              </div>
            </div>
            <button className="btn btn-lyra btn-sm mt-3" type="submit" disabled={updateProduct.isPending}>
              Lưu sản phẩm
            </button>
          </form>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h6">Đánh giá</h2>
          {reviewsQuery.isLoading ? <SkeletonBlock rows={4} /> : (
            <DataTable
              rows={reviews}
              rowKey={(row) => row.id}
              emptyTitle="Chưa có đánh giá"
              emptyDescription="Khách chỉ gửi được đánh giá sau khi đơn giao thành công."
              columns={[
                { key: "rating", header: "Điểm" },
                { key: "comment", header: "Nội dung" },
                {
                  key: "userId",
                  header: "Khách",
                  render: (row) => String(row.userId || "").slice(0, 8) || "-"
                },
                {
                  key: "createdAt",
                  header: "Lúc",
                  render: (row) => formatDateTime(row.createdAt)
                },
                {
                  key: "actions",
                  header: "",
                  render: (row) => (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      disabled={deleteReview.isPending}
                      onClick={() => setPendingReview(row)}
                    >
                      Xóa
                    </button>
                  )
                }
              ]}
            />
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Biến thể</h2>
              <form
                className="mb-3"
                onSubmit={variantForm.handleSubmit((values) => {
                  setProblem(null);
                  createVariant.mutate(values);
                })}
              >
                <div className="row g-2">
                  <div className="col-6">
                    <input type="text" className="form-control" aria-label="SKU biến thể mới" placeholder="SKU" {...variantForm.register("sku", { required: true })} />
                  </div>
                  <div className="col-3">
                    <input type="text" className="form-control" aria-label="Kích thước biến thể mới" placeholder="Size" {...variantForm.register("size", { required: true })} />
                  </div>
                  <div className="col-3">
                    <input type="text" className="form-control" aria-label="Màu biến thể mới" placeholder="Màu" {...variantForm.register("color", { required: true })} />
                  </div>
                  <div className="col-6">
                    <input className="form-control" aria-label="Giá biến thể mới" type="number" step="0.01" placeholder="Giá" {...variantForm.register("price", { valueAsNumber: true })} />
                  </div>
                  <div className="col-6">
                    <input className="form-control" aria-label="Tồn kho biến thể mới" type="number" min="0" placeholder="Tồn kho" {...variantForm.register("stock", { valueAsNumber: true })} />
                  </div>
                </div>
                <button className="btn btn-lyra btn-sm mt-3" type="submit" disabled={createVariant.isPending}>
                  Tạo biến thể
                </button>
              </form>
              {(product.variants || []).length === 0 ? (
                <p className="small text-secondary mb-0">Chưa có biến thể.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {(product.variants || []).map((variant) => (
                    <li className="list-group-item px-0" key={variant.id}>
                      <div className="d-flex justify-content-between gap-3 flex-wrap">
                        <div>
                          <div className="fw-semibold">{variant.sku}</div>
                          <div className="small text-secondary">
                            {variant.size} / {variant.color} · {formatMoney(variant.price)} · version {variant.version}
                          </div>
                          <StatusBadge
                            className={activeClass(variant.active)}
                            label={variant.active ? "Hiện" : "Ẩn"}
                          />
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <form
                            className="d-flex gap-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const stock = Number(new FormData(event.currentTarget).get("stock"));
                              setProblem(null);
                              adjust.mutate({ variantId: variant.id, stock, version: variant.version, reason: new FormData(event.currentTarget).get("reason") });
                            }}
                          >
                            <input name="stock" type="number" min="0" aria-label={`Tồn kho ${variant.sku}`} className="form-control form-control-sm" defaultValue={variant.stock} />
                            <input name="reason" type="text" aria-label={`Lý do điều chỉnh ${variant.sku}`} className="form-control form-control-sm" placeholder="Lý do" required />
                            <button className="btn btn-outline-secondary btn-sm" type="submit">Tồn</button>
                          </form>
                          <form
                            className="d-flex flex-wrap gap-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const data = new FormData(event.currentTarget);
                              setProblem(null);
                              updateVariant.mutate({
                                variantId: variant.id,
                                values: {
                                  sku: data.get("sku"),
                                  size: data.get("size"),
                                  color: data.get("color"),
                                  price: Number(data.get("price")),
                                  version: variant.version
                                }
                              });
                            }}
                          >
                            <input name="sku" type="text" aria-label={`SKU ${variant.sku}`} className="form-control form-control-sm" defaultValue={variant.sku} style={{ width: 110 }} />
                            <input name="size" type="text" aria-label={`Kích thước ${variant.sku}`} className="form-control form-control-sm" defaultValue={variant.size} style={{ width: 64 }} />
                            <input name="color" type="text" aria-label={`Màu ${variant.sku}`} className="form-control form-control-sm" defaultValue={variant.color} style={{ width: 80 }} />
                            <input name="price" type="number" aria-label={`Giá ${variant.sku}`} step="0.01" className="form-control form-control-sm" defaultValue={variant.price} style={{ width: 90 }} />
                            <button className="btn btn-outline-secondary btn-sm" type="submit">Lưu</button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => toggleVariant.mutate({ variantId: variant.id, active: variant.active })}
                            >
                              {variant.active ? "Ẩn" : "Hiện"}
                            </button>
                          </form>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="h6 mt-4">Lịch sử biến động tồn kho</h3>
              {inventoryHistory.isLoading ? <SkeletonBlock rows={3} /> : (
                <DataTable rows={(inventoryHistory.data || []).slice(0, 20)} rowKey={(row) => row.id} emptyTitle="Chưa có biến động tồn kho" columns={[
                  { key: "variantId", header: "Biến thể", render: (row) => (product.variants || []).find((variant) => variant.id === row.variantId)?.sku || row.variantId },
                  { key: "movementType", header: "Nguồn", render: (row) => ({ MANUAL: "Điều chỉnh tay", ORDER_PLACED: "Đặt hàng", ORDER_CANCELLED: "Hủy đơn", ORDER_EXPIRED: "Đơn hết hạn", RETURN_RECEIVED: "Nhận hàng hoàn" }[row.movementType] || row.movementType || "Điều chỉnh tay") },
                  { key: "change", header: "Thay đổi", render: (row) => `${row.stockBefore} → ${row.stockAfter}` },
                  { key: "reason", header: "Lý do" },
                  { key: "createdAt", header: "Thời gian", render: (row) => formatDateTime(row.createdAt) }
                ]} />
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Ảnh (HTTPS URL)</h2>
              <form
                onSubmit={imageForm.handleSubmit((values) => {
                  setProblem(null);
                  createImage.mutate(values);
                })}
              >
                <input type="url" className="form-control mb-2" aria-label="URL ảnh sản phẩm" placeholder="https://..." {...imageForm.register("url", { required: true })} />
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="primary" {...imageForm.register("primary")} />
                  <label className="form-check-label" htmlFor="primary">Ảnh chính</label>
                </div>
                <input className="form-control mb-2" type="number" min="0" {...imageForm.register("sortOrder")} />
                <select className="form-select mb-2" {...imageForm.register("variantId")}>
                  <option value="">Không gắn biến thể</option>
                  {(product.variants || []).map((variant) => (
                    <option key={variant.id} value={variant.id}>{variant.sku}</option>
                  ))}
                </select>
                <button className="btn btn-lyra btn-sm" type="submit" disabled={createImage.isPending}>
                  Thêm ảnh
                </button>
              </form>
              <ul className="list-group list-group-flush mt-3">
                {(product.images || []).map((image) => (
                  <li className="list-group-item px-0 small" key={image.id}>
                    <a href={image.url} target="_blank" rel="noreferrer">
                      {image.primary ? "Ảnh chính" : `Ảnh #${image.sortOrder}`}
                    </a>
                    <form className="row g-2 mt-1" onSubmit={(event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      updateImage.mutate({ imageId: image.id, values: {
                        sortOrder: data.get("sortOrder"), variantId: data.get("variantId"),
                        primary: data.get("primary") === "on"
                      } });
                    }}>
                      <div className="col-3"><input name="sortOrder" type="number" min="0" className="form-control form-control-sm" defaultValue={image.sortOrder} aria-label="Thứ tự ảnh" /></div>
                      <div className="col-5"><select name="variantId" className="form-select form-select-sm" defaultValue={image.variantId || ""}><option value="">Toàn sản phẩm</option>{(product.variants || []).map((variant) => <option key={variant.id} value={variant.id}>{variant.sku}</option>)}</select></div>
                      <div className="col-4 d-flex align-items-center gap-2"><label className="form-check mb-0"><input name="primary" type="checkbox" className="form-check-input" defaultChecked={image.primary} /> Chính</label><button type="submit" className="btn btn-outline-secondary btn-sm">Lưu</button><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setPendingImage(image)}>Xóa</button></div>
                    </form>
                  </li>
                ))}
              </ul>
              <hr />
              <h3 className="h6">Tải ảnh từ máy</h3>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const file = data.get("file");
                  if (!(file instanceof File) || file.size === 0) {
                    return;
                  }
                  setProblem(null);
                  uploadImage.mutate({
                    file,
                    values: {
                      primary: data.get("primary") === "on",
                      sortOrder: Number(data.get("sortOrder")),
                      variantId: data.get("variantId") || undefined
                    }
                  });
                }}
              >
                <input name="file" type="file" accept="image/jpeg,image/png,image/webp" className="form-control mb-2" required />
                <div className="form-check mb-2">
                  <input name="primary" className="form-check-input" type="checkbox" id="upload-primary" />
                  <label className="form-check-label" htmlFor="upload-primary">Ảnh chính</label>
                </div>
                <input name="sortOrder" className="form-control mb-2" type="number" min="0" defaultValue="0" />
                <select name="variantId" className="form-select mb-2">
                  <option value="">Không gắn biến thể</option>
                  {(product.variants || []).map((variant) => (
                    <option key={variant.id} value={variant.id}>{variant.sku}</option>
                  ))}
                </select>
                <button className="btn btn-outline-secondary btn-sm" type="submit" disabled={uploadImage.isPending}>
                  Tải ảnh lên
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={Boolean(pendingReview)}
        title="Xóa đánh giá"
        message="Đánh giá sẽ bị xóa khỏi sản phẩm. Không hoàn tác được."
        confirmLabel="Xóa"
        danger
        onCancel={() => setPendingReview(null)}
        onConfirm={() => {
          setProblem(null);
          deleteReview.mutate(pendingReview.id);
          setPendingReview(null);
        }}
      />
      <ConfirmModal
        open={Boolean(pendingImage)}
        title="Xóa ảnh sản phẩm"
        message="Ảnh sẽ bị xóa khỏi sản phẩm; file tải lên cũng sẽ bị xóa khỏi máy chủ."
        confirmLabel="Xóa ảnh"
        danger
        onCancel={() => setPendingImage(null)}
        onConfirm={() => {
          setProblem(null);
          deleteImage.mutate(pendingImage.id);
          setPendingImage(null);
        }}
      />
    </div>
  );
}

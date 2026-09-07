import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import { parseApiError } from "../../services/api/errors.js";
import { activeClass } from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [sessionVariants, setSessionVariants] = useState([]);
  const [sessionImages, setSessionImages] = useState([]);
  const [problem, setProblem] = useState(null);
  const pushToast = useToastStore((state) => state.push);
  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminApi.listProducts
  });
  const product = useMemo(
    () => (products.data || []).find((item) => item.id === id),
    [products.data, id]
  );
  const catalog = useQuery({
    queryKey: ["public", "products", id],
    queryFn: () => adminApi.getPublicProduct(id),
    enabled: Boolean(product?.active)
  });
  const reviews = useQuery({
    queryKey: ["public", "products", id, "reviews"],
    queryFn: () => adminApi.listProductReviews(id),
    enabled: Boolean(product?.active)
  });

  const variantForm = useForm({
    defaultValues: { sku: "", size: "", color: "", price: 0, stock: 0 }
  });
  const imageForm = useForm({
    defaultValues: { url: "", primary: false, sortOrder: 0, variantId: "" }
  });

  const createVariant = useMutation({
    mutationFn: (values) => adminApi.createVariant(id, values),
    onSuccess: (created) => {
      setSessionVariants((current) => [created, ...current]);
      variantForm.reset();
      queryClient.invalidateQueries({ queryKey: ["public", "products", id] });
      pushToast("Đã tạo biến thể");
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
    onSuccess: (created) => {
      setSessionImages((current) => [created, ...current]);
      imageForm.reset({ url: "", primary: false, sortOrder: 0, variantId: "" });
      queryClient.invalidateQueries({ queryKey: ["public", "products", id] });
      pushToast("Đã thêm ảnh");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const deleteReview = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public", "products", id, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["public", "products", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      pushToast("Đã xóa đánh giá");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const adjust = useMutation({
    mutationFn: ({ variantId, stock, version }) =>
      adminApi.adjustInventory(id, variantId, { stock, version }),
    onSuccess: async (updated) => {
      setSessionVariants((current) => current.map((item) => (
        item.id === updated.variantId
          ? { ...item, stock: updated.stock, version: updated.version }
          : item
      )));
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (error) => setProblem(parseApiError(error))
  });

  if (products.isLoading) {
    return <SkeletonBlock rows={8} />;
  }
  if (products.isError) {
    return <ErrorAlert error={products.error} />;
  }
  if (!product) {
    return (
      <ErrorAlert
        problem={{
          status: 404,
          code: "PRODUCT_NOT_FOUND",
          message: "Không tìm thấy sản phẩm trong danh sách quản trị. Backend chưa có GET theo id.",
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
        description={`${product.slug} · ${formatMoney(product.basePrice)}`}
        actions={(
          <StatusBadge
            className={activeClass(product.active)}
            label={product.active ? "Hiện" : "Ẩn"}
          />
        )}
      />
      <ErrorAlert problem={problem} />
      {product.active && catalog.isError && (
        <p className="small text-secondary">
          Catalog công khai không trả sản phẩm này (ẩn khỏi khách hoặc thiếu biến thể đang bán).
        </p>
      )}
      {!product.active && (
        <p className="small text-secondary">
          Sản phẩm đang ẩn nên catalog công khai không trả chi tiết.
        </p>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h6">Đánh giá trên catalog công khai</h2>
          {!product.active ? (
            <p className="small text-secondary mb-0">
              Sản phẩm đang ẩn. GET /api/v1/products/{"{id}"}/reviews trả 404 nếu sản phẩm không active.
            </p>
          ) : reviews.isLoading ? (
            <SkeletonBlock rows={4} />
          ) : reviews.isError ? (
            <p className="small text-secondary mb-0">
              Không tải được đánh giá công khai (sản phẩm ẩn khỏi khách hoặc catalog không trả sản phẩm).
            </p>
          ) : (
            <DataTable
              rows={reviews.data || []}
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
                      onClick={() => {
                        if (window.confirm("Xóa đánh giá này?")) {
                          setProblem(null);
                          deleteReview.mutate(row.id);
                        }
                      }}
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

      {catalog.data && (
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="h6">Catalog đang hiện với khách</h2>
            {catalog.data.averageRating != null && (
              <p className="small text-secondary mb-3">
                Điểm trung bình {catalog.data.averageRating} · {catalog.data.reviewCount} đánh giá
              </p>
            )}
            <div className="row g-3">
              <div className="col-lg-7">
                <h3 className="h6">Biến thể đang bán</h3>
                {(catalog.data.variants || []).length === 0 ? (
                  <p className="small text-secondary mb-0">Chưa có biến thể đang hiện.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {catalog.data.variants.map((variant) => (
                      <li className="list-group-item px-0 d-flex justify-content-between" key={variant.id}>
                        <span>{variant.sku} · {variant.size} / {variant.color}</span>
                        <span className="text-secondary">
                          {formatMoney(variant.price)} · tồn {variant.stock}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-lg-5">
                <h3 className="h6">Ảnh</h3>
                {(catalog.data.images || []).length === 0 ? (
                  <p className="small text-secondary mb-0">Chưa có ảnh trên catalog.</p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {catalog.data.images.map((image) => (
                      <a
                        key={image.id}
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="small"
                      >
                        {image.primary ? "Ảnh chính" : `Ảnh #${image.sortOrder}`}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Tạo biến thể / SKU / tồn kho</h2>
              <p className="small text-secondary">
                Backend không trả danh sách biến thể cho quản trị. Form này dùng POST tạo mới;
                tồn kho chỉ sửa được khi phản hồi trả về version.
              </p>
              <form
                onSubmit={variantForm.handleSubmit((values) => {
                  setProblem(null);
                  createVariant.mutate(values);
                })}
              >
                <div className="row g-2">
                  <div className="col-6">
                    <input className="form-control" placeholder="SKU" {...variantForm.register("sku", { required: true })} />
                  </div>
                  <div className="col-3">
                    <input className="form-control" placeholder="Size" {...variantForm.register("size", { required: true })} />
                  </div>
                  <div className="col-3">
                    <input className="form-control" placeholder="Màu" {...variantForm.register("color", { required: true })} />
                  </div>
                  <div className="col-6">
                    <input className="form-control" type="number" step="0.01" placeholder="Giá" {...variantForm.register("price", { valueAsNumber: true })} />
                  </div>
                  <div className="col-6">
                    <input className="form-control" type="number" min="0" placeholder="Tồn kho" {...variantForm.register("stock", { valueAsNumber: true })} />
                  </div>
                </div>
                <button className="btn btn-lyra btn-sm mt-3" type="submit" disabled={createVariant.isPending}>
                  Tạo biến thể
                </button>
              </form>
              <ul className="list-group list-group-flush mt-3">
                {sessionVariants.map((variant) => (
                  <li className="list-group-item px-0" key={variant.id}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{variant.sku}</div>
                        <div className="small text-secondary">
                          {variant.size} / {variant.color} · {formatMoney(variant.price)} · tồn {variant.stock}
                        </div>
                      </div>
                      <form
                        className="d-flex gap-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const stock = Number(new FormData(event.currentTarget).get("stock"));
                          setProblem(null);
                          adjust.mutate({ variantId: variant.id, stock, version: variant.version });
                        }}
                      >
                        <input name="stock" type="number" min="0" className="form-control form-control-sm" defaultValue={variant.stock} />
                        <button className="btn btn-outline-secondary btn-sm" type="submit">Cập nhật tồn</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Ảnh sản phẩm (HTTPS URL)</h2>
              <form
                onSubmit={imageForm.handleSubmit((values) => {
                  setProblem(null);
                  createImage.mutate(values);
                })}
              >
                <input className="form-control mb-2" placeholder="https://..." {...imageForm.register("url", { required: true })} />
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="primary" {...imageForm.register("primary")} />
                  <label className="form-check-label" htmlFor="primary">Ảnh chính</label>
                </div>
                <input className="form-control mb-2" type="number" min="0" {...imageForm.register("sortOrder")} />
                <button className="btn btn-lyra btn-sm" type="submit" disabled={createImage.isPending}>
                  Thêm ảnh
                </button>
              </form>
              <ul className="list-group list-group-flush mt-3">
                {sessionImages.map((image) => (
                  <li className="list-group-item px-0 small" key={image.id}>
                    {image.url}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import { formatMoney } from "../../utils/format.js";
import { parseApiError } from "../../services/api/errors.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [sessionVariants, setSessionVariants] = useState([]);
  const [sessionImages, setSessionImages] = useState([]);
  const [problem, setProblem] = useState(null);
  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminApi.listProducts
  });
  const product = useMemo(
    () => (products.data || []).find((item) => item.id === id),
    [products.data, id]
  );

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
    return <LoadingState />;
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
          message: "Khong tim thay san pham trong danh sach admin. Backend khong co GET theo id.",
          fieldErrors: {}
        }}
      />
    );
  }

  return (
    <div>
      <h1 className="h4 mb-2">{product.name}</h1>
      <p className="text-secondary">{product.slug} · {formatMoney(product.basePrice)} · {product.active ? "Hien" : "An"}</p>
      <ErrorAlert problem={problem} />

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Tao bien the / SKU / ton kho</h2>
              <p className="small text-secondary">
                Backend khong tra danh sach bien the cho admin. Form nay dung POST tao moi;
                ton kho chi sua duoc khi response tra ve version.
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
                    <input className="form-control" placeholder="Mau" {...variantForm.register("color", { required: true })} />
                  </div>
                  <div className="col-6">
                    <input className="form-control" type="number" step="0.01" placeholder="Gia" {...variantForm.register("price", { valueAsNumber: true })} />
                  </div>
                  <div className="col-6">
                    <input className="form-control" type="number" min="0" placeholder="Ton kho" {...variantForm.register("stock", { valueAsNumber: true })} />
                  </div>
                </div>
                <button className="btn btn-dark btn-sm mt-3" type="submit" disabled={createVariant.isPending}>
                  Tao bien the
                </button>
              </form>
              <ul className="list-group list-group-flush mt-3">
                {sessionVariants.map((variant) => (
                  <li className="list-group-item px-0" key={variant.id}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{variant.sku}</div>
                        <div className="small text-secondary">
                          {variant.size} / {variant.color} · {formatMoney(variant.price)} · stock {variant.stock}
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
                        <button className="btn btn-outline-secondary btn-sm" type="submit">Cap ton</button>
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
              <h2 className="h6">Anh san pham (HTTPS URL)</h2>
              <form
                onSubmit={imageForm.handleSubmit((values) => {
                  setProblem(null);
                  createImage.mutate(values);
                })}
              >
                <input className="form-control mb-2" placeholder="https://..." {...imageForm.register("url", { required: true })} />
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="primary" {...imageForm.register("primary")} />
                  <label className="form-check-label" htmlFor="primary">Anh chinh</label>
                </div>
                <input className="form-control mb-2" type="number" min="0" {...imageForm.register("sortOrder")} />
                <button className="btn btn-dark btn-sm" type="submit" disabled={createImage.isPending}>
                  Them anh
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

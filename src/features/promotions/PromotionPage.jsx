import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import { activeClass } from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";

const EMPTY_FORM = {
  name: "",
  description: "",
  discountPercent: 10,
  startsAt: "",
  endsAt: "",
  active: true,
  productIds: []
};

function toLocalInput(value) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

export default function PromotionPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const form = useForm({ defaultValues: EMPTY_FORM });
  const promotions = useQuery({ queryKey: ["admin", "promotions"], queryFn: adminApi.listPromotions });
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: adminApi.listProducts });

  const productNames = useMemo(() => new Map(
    (products.data || []).map((product) => [String(product.id), product.name])
  ), [products.data]);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin", "promotions"] });
  }

  function resetForm() {
    setEditingId(null);
    form.reset(EMPTY_FORM);
  }

  function handleInvalid() {
    pushToast("Vui lòng kiểm tra các trường còn thiếu hoặc chưa hợp lệ", "danger");
  }

  const save = useMutation({
    mutationFn: (values) => editingId
      ? adminApi.updatePromotion(editingId, values)
      : adminApi.createPromotion(values),
    onSuccess: () => {
      refresh();
      resetForm();
      pushToast(editingId ? "Đã cập nhật khuyến mãi" : "Đã tạo khuyến mãi");
    }
  });
  const remove = useMutation({
    mutationFn: adminApi.deletePromotion,
    onSuccess: () => {
      refresh();
      pushToast("Đã xóa khuyến mãi");
    }
  });

  const selectedProducts = form.watch("productIds") || [];

  return (
    <div>
      <PageHeader
        title="Khuyến mãi"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Khuyến mãi" }]}
        description="Tạo chương trình giảm giá và chọn tối đa 100 sản phẩm áp dụng."
      />
      {(promotions.error || products.error || save.error || remove.error) && (
        <ErrorAlert error={promotions.error || products.error || save.error || remove.error} />
      )}
      <div className="row g-4">
        <div className="col-lg-5">
          <form
            className="card card-body"
            noValidate
            onSubmit={form.handleSubmit((values) => save.mutate(values), handleInvalid)}
          >
            <h2 className="h6">{editingId ? "Sửa khuyến mãi" : "Tạo khuyến mãi"}</h2>
            <label className="form-label" htmlFor="promotion-name">Tên</label>
            <input
              id="promotion-name"
              className={`form-control ${form.formState.errors.name ? "is-invalid" : ""}`}
              aria-describedby={form.formState.errors.name ? "promotion-name-error" : undefined}
              {...form.register("name", {
                required: "Vui lòng nhập tên khuyến mãi",
                maxLength: { value: 255, message: "Tên không được vượt quá 255 ký tự" },
                validate: (value) => value.trim().length > 0 || "Vui lòng nhập tên khuyến mãi"
              })}
            />
            <div id="promotion-name-error" className="invalid-feedback mb-2">
              {form.formState.errors.name?.message}
            </div>
            <label className="form-label" htmlFor="promotion-description">Mô tả</label>
            <textarea
              id="promotion-description"
              className={`form-control ${form.formState.errors.description ? "is-invalid" : ""}`}
              rows="2"
              {...form.register("description", {
                maxLength: { value: 2000, message: "Mô tả không được vượt quá 2.000 ký tự" }
              })}
            />
            <div className="invalid-feedback mb-2">{form.formState.errors.description?.message}</div>
            <div className="row g-2 mb-2">
              <div className="col-4">
                <label className="form-label" htmlFor="promotion-discount">Giảm (%)</label>
                <input
                  id="promotion-discount"
                  type="number"
                  min="1"
                  max="100"
                  className={`form-control ${form.formState.errors.discountPercent ? "is-invalid" : ""}`}
                  {...form.register("discountPercent", {
                    valueAsNumber: true,
                    required: "Vui lòng nhập phần trăm giảm",
                    min: { value: 1, message: "Mức giảm phải từ 1%" },
                    max: { value: 100, message: "Mức giảm không được quá 100%" }
                  })}
                />
                <div className="invalid-feedback">{form.formState.errors.discountPercent?.message}</div>
              </div>
              <div className="col-8">
                <label className="form-label" htmlFor="promotion-start">Bắt đầu</label>
                <input
                  id="promotion-start"
                  type="datetime-local"
                  className={`form-control ${form.formState.errors.startsAt ? "is-invalid" : ""}`}
                  {...form.register("startsAt", { required: "Vui lòng chọn thời gian bắt đầu" })}
                />
                <div className="invalid-feedback">{form.formState.errors.startsAt?.message}</div>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="promotion-end">Kết thúc</label>
                <input
                  id="promotion-end"
                  type="datetime-local"
                  className={`form-control ${form.formState.errors.endsAt ? "is-invalid" : ""}`}
                  {...form.register("endsAt", {
                    required: "Vui lòng chọn thời gian kết thúc",
                    validate: (value) => (
                      !form.getValues("startsAt")
                      || new Date(value) > new Date(form.getValues("startsAt"))
                      || "Thời gian kết thúc phải sau thời gian bắt đầu"
                    )
                  })}
                />
                <div className="invalid-feedback">{form.formState.errors.endsAt?.message}</div>
              </div>
            </div>
            <div className="form-check mb-3">
              <input id="promotion-active" type="checkbox" className="form-check-input" {...form.register("active")} />
              <label className="form-check-label" htmlFor="promotion-active">Kích hoạt</label>
            </div>
            <label className="form-label" htmlFor="promotion-products">Sản phẩm ({selectedProducts.length}/100)</label>
            <select
              id="promotion-products"
              multiple
              size="8"
              className={`form-select ${form.formState.errors.productIds ? "is-invalid" : ""}`}
              aria-describedby={form.formState.errors.productIds ? "promotion-products-error" : undefined}
              {...form.register("productIds", {
                validate: (value) => {
                  if (!value?.length) return "Vui lòng chọn ít nhất một sản phẩm";
                  return value.length <= 100 || "Chỉ được chọn tối đa 100 sản phẩm";
                }
              })}
            >
              {(products.data || []).map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <div id="promotion-products-error" className="invalid-feedback mb-3">
              {form.formState.errors.productIds?.message}
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-lyra btn-sm" disabled={save.isPending}>
                {save.isPending ? "Đang lưu..." : "Lưu"}
              </button>
              {editingId && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm}>Hủy</button>}
            </div>
          </form>
        </div>
        <div className="col-lg-7">
          {promotions.isLoading ? <SkeletonBlock rows={6} /> : (
            <div className="d-flex flex-column gap-3">
              {(promotions.data || []).map((promotion) => (
                <div className="card" key={promotion.id}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between gap-3">
                      <div>
                        <h2 className="h6 mb-1">{promotion.title}</h2>
                        <div className="small text-secondary">
                          Giảm {promotion.discountPercent}% · {formatDateTime(promotion.startsAt)} → {formatDateTime(promotion.endsAt)}
                        </div>
                      </div>
                      <StatusBadge className={activeClass(promotion.active)} label={promotion.active ? "Bật" : "Tắt"} />
                    </div>
                    {promotion.description && <p className="small mt-2 mb-2">{promotion.description}</p>}
                    <ul className="small mb-3">
                      {(promotion.items || []).map((item) => (
                        <li key={item.productId}>
                          {productNames.get(String(item.productId)) || item.productId}: {formatMoney(item.salePrice)}
                        </li>
                      ))}
                    </ul>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => {
                        setEditingId(promotion.id);
                        form.reset({
                          name: promotion.title,
                          description: promotion.description || "",
                          discountPercent: promotion.discountPercent,
                          startsAt: toLocalInput(promotion.startsAt),
                          endsAt: toLocalInput(promotion.endsAt),
                          active: promotion.active,
                          productIds: (promotion.items || []).map((item) => String(item.productId))
                        });
                      }}>Sửa</button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setPendingDelete(promotion)}>Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
              {(promotions.data || []).length === 0 && <div className="card card-body text-secondary">Chưa có chương trình khuyến mãi.</div>}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Xóa khuyến mãi"
        message={`Xóa “${pendingDelete?.title || ""}”. Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          remove.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import PaginationBar from "../../components/tables/PaginationBar.jsx";
import { useServerList } from "../../hooks/useServerList.js";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import { useToastStore } from "../../store/toastStore.js";

const defaults = { code: "", label: "", type: "discount", discountType: "PERCENT", discountValue: 0, maxDiscountAmount: "", minimumOrderAmount: 0, startsAt: "", endsAt: "", totalUsageLimit: "", perUserLimit: 1, active: true };
const local = (value) => value ? new Date(value).toISOString().slice(0, 16) : "";

export default function VoucherPage() {
  const queryClient = useQueryClient();
  const toast = useToastStore((state) => state.push);
  const [editing, setEditing] = useState(null);
  const form = useForm({ defaultValues: defaults });
  const list = useServerList({ defaultSortKey: "code" });
  const query = useQuery({ queryKey: ["admin", "vouchers", "page", list.request], queryFn: () => adminApi.listVouchersPage(list.request) });
  const rows = query.data?.content || [];
  const save = useMutation({ mutationFn: (values) => editing ? adminApi.updateVoucher(editing, values) : adminApi.createVoucher(values), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] }); setEditing(null); form.reset(defaults); toast("Đã lưu voucher"); } });
  const remove = useMutation({ mutationFn: adminApi.deleteVoucher, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] }); toast("Đã vô hiệu hóa voucher"); } });
  function edit(row) { setEditing(row.id); form.reset({ ...row, maxDiscountAmount: row.maxDiscountAmount ?? "", totalUsageLimit: row.totalUsageLimit ?? "", startsAt: local(row.startsAt), endsAt: local(row.endsAt) }); }

  return <div>
    <PageHeader title="Voucher" crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Voucher" }]} description="Quản lý mã giảm giá, điều kiện đơn hàng và giới hạn sử dụng." />
    {(query.isError || save.isError || remove.isError) && <ErrorAlert error={query.error || save.error || remove.error} />}
    <div className="card card-body mb-3"><h2 className="h6">{editing ? "Sửa voucher" : "Tạo voucher"}</h2>
      <form onSubmit={form.handleSubmit((values) => save.mutate(values))}><div className="row g-3">
        <div className="col-md-3"><label className="form-label" htmlFor="voucher-code">Mã</label><input id="voucher-code" type="text" className="form-control" readOnly={Boolean(editing)} {...form.register("code", { required: true })} /></div>
        <div className="col-md-5"><label className="form-label" htmlFor="voucher-label">Tên hiển thị</label><input id="voucher-label" type="text" className="form-control" {...form.register("label", { required: true })} /></div>
        <div className="col-md-2"><label className="form-label" htmlFor="voucher-type">Loại</label><select id="voucher-type" className="form-select" {...form.register("type")}><option value="discount">Giảm giá</option><option value="shipping">Vận chuyển</option></select></div>
        <div className="col-md-2"><label className="form-label" htmlFor="voucher-discount-type">Cách giảm</label><select id="voucher-discount-type" className="form-select" {...form.register("discountType")}><option value="PERCENT">Phần trăm</option><option value="FIXED">Số tiền</option><option value="FREESHIP">Freeship</option></select></div>
        <div className="col-md-3"><label className="form-label" htmlFor="voucher-value">Giá trị giảm</label><input id="voucher-value" type="number" min="0" className="form-control" {...form.register("discountValue", { valueAsNumber: true })} /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="voucher-max">Giảm tối đa</label><input id="voucher-max" type="number" min="0" className="form-control" {...form.register("maxDiscountAmount")} /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="voucher-min">Đơn tối thiểu</label><input id="voucher-min" type="number" min="0" className="form-control" {...form.register("minimumOrderAmount", { valueAsNumber: true })} /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="voucher-per-user">Giới hạn mỗi người</label><input id="voucher-per-user" type="number" min="1" className="form-control" {...form.register("perUserLimit", { valueAsNumber: true })} /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="voucher-start">Bắt đầu</label><input id="voucher-start" type="datetime-local" className="form-control" {...form.register("startsAt", { required: true })} /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="voucher-end">Kết thúc</label><input id="voucher-end" type="datetime-local" className="form-control" {...form.register("endsAt", { required: true })} /></div>
        <div className="col-md-3"><label className="form-label" htmlFor="voucher-total">Tổng lượt dùng</label><input id="voucher-total" type="number" min="1" className="form-control" placeholder="Không giới hạn" {...form.register("totalUsageLimit")} /></div>
        <div className="col-md-3 d-flex align-items-end"><div className="form-check mb-2"><input id="voucher-active" type="checkbox" className="form-check-input" {...form.register("active")} /><label className="form-check-label" htmlFor="voucher-active">Đang hoạt động</label></div></div>
      </div><div className="d-flex gap-2 mt-3"><button type="submit" className="btn btn-lyra btn-sm" disabled={save.isPending}>{save.isPending ? "Đang lưu..." : "Lưu"}</button>{editing && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setEditing(null); form.reset(defaults); }}>Hủy sửa</button>}</div></form>
    </div>
    <div className="mb-3"><SearchField value={list.queryText} onChange={list.setQueryText} placeholder="Tìm mã hoặc tên voucher..." /></div>
    {query.isLoading ? <SkeletonBlock rows={5} /> : <div className="card card-body p-0"><DataTable rows={rows} rowKey={(row) => row.id} emptyTitle="Chưa có voucher" sortKey={list.sortKey} sortDir={list.sortDir} onSort={list.toggleSort} columns={[
      { key: "code", header: "Mã", sortable: true }, { key: "label", header: "Tên", sortable: true },
      { key: "discountValue", header: "Mức giảm", sortable: true, render: (row) => row.discountType === "PERCENT" ? `${row.discountValue}%` : row.discountType === "FREESHIP" ? "Freeship" : formatMoney(row.discountValue) },
      { key: "period", header: "Thời gian", render: (row) => `${formatDateTime(row.startsAt)} – ${formatDateTime(row.endsAt)}` },
      { key: "usageCount", header: "Đã dùng" }, { key: "active", header: "Trạng thái", sortable: true, render: (row) => row.active ? "Bật" : "Tắt" },
      { key: "actions", header: "", render: (row) => <div className="d-flex gap-2"><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => edit(row)}>Sửa</button>{row.active && <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove.mutate(row.id)}>Tắt</button>}</div> }
    ]} /><PaginationBar page={list.page} totalPages={Math.max(1, query.data?.totalPages || 1)} total={query.data?.totalElements || 0} pageSize={list.pageSize} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} /></div>}
  </div>;
}

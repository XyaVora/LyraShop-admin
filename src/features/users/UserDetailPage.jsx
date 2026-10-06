import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { formatDateTime, formatMoney } from "../../utils/format.js";
import { activeClass, ORDER_STATUS_LABEL, orderStatusClass } from "../../utils/status.js";
import { useToastStore } from "../../store/toastStore.js";

export default function UserDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [supportNote, setSupportNote] = useState("");
  const query = useQuery({ queryKey: ["admin", "users", id], queryFn: () => adminApi.getUser(id) });
  const addNote = useMutation({
    mutationFn: () => adminApi.addUserSupportNote(id, supportNote),
    onSuccess: () => {
      setSupportNote("");
      queryClient.invalidateQueries({ queryKey: ["admin", "users", id] });
      pushToast("Đã thêm ghi chú chăm sóc khách hàng");
    }
  });
  if (query.isLoading) return <SkeletonBlock rows={8} />;
  if (query.isError) return <ErrorAlert error={query.error} />;
  const { user, orders = [], addresses = [], supportNotes = [] } = query.data;
  return <div>
    <PageHeader title={user.fullName || user.email}
      crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Tài khoản", to: "/users" }, { label: user.email }]}
      description="Hồ sơ, số dư khách hàng và lịch sử mua hàng." />
    <div className="row g-3 mb-3">
      <div className="col-lg-7"><div className="card card-body h-100"><h2 className="h6">Thông tin tài khoản</h2>
        <div className="row g-3 small"><div className="col-md-6"><span className="text-secondary">Email</span><div>{user.email}</div></div>
          <div className="col-md-6"><span className="text-secondary">Số điện thoại</span><div>{user.phone || "-"}</div></div>
          <div className="col-md-4"><span className="text-secondary">Vai trò</span><div>{{ ADMIN: "Quản trị", CATALOG_MANAGER: "Quản lý catalog", ORDER_MANAGER: "Quản lý đơn hàng", SUPPORT: "Hỗ trợ", CUSTOMER: "Khách" }[user.role] || user.role}</div></div>
          <div className="col-md-4"><span className="text-secondary">Trạng thái</span><div><StatusBadge className={activeClass(user.active)} label={user.active ? "Hoạt động" : "Đã khóa"} /></div></div>
          <div className="col-md-4"><span className="text-secondary">Ngày tạo</span><div>{formatDateTime(user.createdAt)}</div></div></div>
      </div></div>
      <div className="col-lg-5"><div className="card card-body h-100"><h2 className="h6">Giá trị khách hàng</h2>
        <div className="display-6">{formatMoney(query.data.netPaidTotal)}</div><div className="text-secondary small mb-3">Tổng chi tiêu ròng đã thanh toán</div>
        <div className="d-flex gap-4"><div><strong>{query.data.loyaltyCoinBalance}</strong><div className="small text-secondary">Xu khả dụng</div></div><div><strong>{query.data.loyaltyCoinDebt}</strong><div className="small text-secondary">Xu đang nợ</div></div><div><strong>{orders.length}</strong><div className="small text-secondary">Đơn hàng</div></div></div>
      </div></div>
    </div>
    <div className="row g-3 mb-3">
      <div className="col-lg-6"><section className="card card-body h-100" aria-labelledby="address-heading">
        <h2 id="address-heading" className="h6">Địa chỉ giao hàng</h2>
        {addresses.length === 0 ? <p className="text-secondary small mb-0">Khách chưa lưu địa chỉ.</p> :
          <div className="d-grid gap-2">{addresses.map((address) => <div className="border rounded p-3 small" key={address.id}>
            <div className="d-flex justify-content-between gap-2"><strong>{address.recipientName}</strong>{address.isDefault && <span className="badge text-bg-primary">Mặc định</span>}</div>
            <div>{address.phone}</div>
            <div className="text-secondary">{[address.addressLine, address.ward, address.district, address.city].filter(Boolean).join(", ")}</div>
          </div>)}</div>}
      </section></div>
      <div className="col-lg-6"><section className="card card-body h-100" aria-labelledby="support-note-heading">
        <h2 id="support-note-heading" className="h6">Ghi chú chăm sóc</h2>
        <form className="mb-3" onSubmit={(event) => { event.preventDefault(); if (supportNote.trim()) addNote.mutate(); }}>
          <label className="form-label small" htmlFor="support-note">Ghi chú nội bộ</label>
          <textarea id="support-note" className="form-control" rows="3" maxLength="2000" value={supportNote}
            onChange={(event) => setSupportNote(event.target.value)} placeholder="Ví dụ: khách muốn được gọi trước khi giao..." />
          {addNote.isError && <ErrorAlert error={addNote.error} />}
          <div className="d-flex justify-content-between align-items-center mt-2"><small className="text-secondary">{supportNote.length}/2000</small>
            <button className="btn btn-lyra btn-sm" type="submit" disabled={!supportNote.trim() || addNote.isPending}>{addNote.isPending ? "Đang lưu..." : "Thêm ghi chú"}</button></div>
        </form>
        {supportNotes.length === 0 ? <p className="text-secondary small mb-0">Chưa có ghi chú.</p> :
          <div className="d-grid gap-2">{supportNotes.map((note) => <div className="border-start border-3 ps-3 small" key={note.id}>
            <div>{note.note}</div><div className="text-secondary mt-1">{note.createdByName} · {formatDateTime(note.createdAt)}</div>
          </div>)}</div>}
      </section></div>
    </div>
    <div className="card"><div className="card-header bg-transparent"><h2 className="h6 mb-0">Lịch sử đơn hàng</h2></div><div className="card-body p-0">
      <DataTable rows={orders} rowKey={(row) => row.id} emptyTitle="Khách chưa có đơn hàng" columns={[
        { key: "id", header: "Mã", render: (row) => <Link to={`/orders/${row.id}`}>#{row.id.slice(0, 8).toUpperCase()}</Link> },
        { key: "totalAmount", header: "Tổng", render: (row) => formatMoney(row.totalAmount) },
        { key: "status", header: "Trạng thái", render: (row) => <StatusBadge className={orderStatusClass(row.status)} label={ORDER_STATUS_LABEL[row.status] || row.status} /> },
        { key: "createdAt", header: "Tạo lúc", render: (row) => formatDateTime(row.createdAt) }
      ]} />
    </div></div>
  </div>;
}

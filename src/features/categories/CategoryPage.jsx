import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import ExportCsvButton from "../../components/common/ExportCsvButton.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import PaginationBar from "../../components/tables/PaginationBar.jsx";
import { useListView } from "../../hooks/useListView.js";
import { activeClass } from "../../utils/status.js";
import { parseApiError } from "../../services/api/errors.js";
import { slugify } from "../../utils/format.js";
import { useToastStore } from "../../store/toastStore.js";

const SEARCH_FIELDS = ["name", "slug"];

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional(),
  parentId: z.string().optional()
});

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const [problem, setProblem] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [pendingHide, setPendingHide] = useState(null);
  const query = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: adminApi.listCategories
  });
  const list = useListView(query.data || [], {
    fields: SEARCH_FIELDS,
    defaultSortKey: "name"
  });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "", parentId: "" }
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    queryClient.invalidateQueries({ queryKey: ["public", "categories"] });
  }

  const create = useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      form.reset();
      invalidate();
      pushToast("Đã tạo danh mục");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const update = useMutation({
    mutationFn: ({ id, values }) => adminApi.updateCategory(id, values),
    onSuccess: () => {
      setEditingId(null);
      form.reset();
      invalidate();
      pushToast("Đã cập nhật danh mục");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const deactivate = useMutation({
    mutationFn: adminApi.deactivateCategory,
    onSuccess: () => {
      invalidate();
      pushToast("Đã ẩn danh mục");
    },
    onError: (error) => setProblem(parseApiError(error))
  });
  const activate = useMutation({
    mutationFn: adminApi.activateCategory,
    onSuccess: () => {
      invalidate();
      pushToast("Đã hiện danh mục");
    },
    onError: (error) => setProblem(parseApiError(error))
  });

  function submit(values) {
    setProblem(null);
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      parentId: values.parentId || undefined
    };
    if (editingId) {
      update.mutate({ id: editingId, values: payload });
    } else {
      create.mutate(payload);
    }
  }

  return (
    <div>
      <PageHeader
        title="Danh mục"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Danh mục" }]}
        description="Danh sách quản trị gồm cả danh mục ẩn. Hiện lại dùng PATCH activate. Form cha chỉ nên chọn danh mục đang hiện."
      />
      <ErrorAlert problem={problem} />
      {query.isError && <ErrorAlert error={query.error} />}
      <div className="row g-4">
        <div className="col-lg-5">
          <form className="card card-body" onSubmit={form.handleSubmit(submit)}>
            <h2 className="h6">{editingId ? "Sửa danh mục" : "Tạo danh mục"}</h2>
            <label className="form-label" htmlFor="category-name">Tên</label>
            <input id="category-name" type="text" className="form-control mb-2" {...form.register("name", {
              onChange: (event) => form.setValue("slug", slugify(event.target.value))
            })} />
            <label className="form-label" htmlFor="category-slug">Slug</label>
            <input id="category-slug" type="text" className="form-control mb-2" {...form.register("slug")} />
            <label className="form-label" htmlFor="category-description">Mô tả</label>
            <textarea id="category-description" className="form-control mb-2" {...form.register("description")} />
            <label className="form-label" htmlFor="category-parent">Danh mục cha</label>
            <select id="category-parent" className="form-select mb-3" {...form.register("parentId")}>
              <option value="">Không có danh mục cha</option>
              {(query.data || []).filter((item) => item.id !== editingId && item.active !== false).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <div className="d-flex gap-2">
              <button className="btn btn-lyra btn-sm" type="submit">Lưu</button>
              {editingId && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    form.reset();
                  }}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <SearchField value={list.queryText} onChange={list.setQueryText} placeholder="Tìm danh mục..." />
                <ExportCsvButton
                  filename="lyra-categories.csv"
                  rows={list.allRows}
                  columns={[
                    { header: "id", value: (row) => row.id },
                    { header: "name", value: (row) => row.name },
                    { header: "slug", value: (row) => row.slug },
                    { header: "parentId", value: (row) => row.parentId }
                  ]}
                />
              </div>
              {query.isLoading ? <SkeletonBlock /> : (
                <>
                <DataTable
                  rows={list.rows}
                  rowKey={(row) => row.id}
                  emptyTitle="Chưa có danh mục"
                  sortKey={list.sortKey}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                  columns={[
                    { key: "name", header: "Tên", sortable: true },
                    { key: "slug", header: "Slug", sortable: true },
                    { key: "parentId", header: "Cha", sortable: true },
                    {
                      key: "active",
                      header: "Trạng thái",
                      sortable: true,
                      render: (row) => (
                        <StatusBadge
                          className={activeClass(row.active)}
                          label={row.active ? "Hiện" : "Ẩn"}
                        />
                      )
                    },
                    {
                      key: "actions",
                      header: "",
                      render: (row) => (
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setEditingId(row.id);
                              form.reset({
                                name: row.name,
                                slug: row.slug,
                                description: row.description || "",
                                parentId: row.parentId ? String(row.parentId) : ""
                              });
                            }}
                          >
                            Sửa
                          </button>
                          {row.active ? (
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => setPendingHide(row)}
                            >
                              Ẩn
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => activate.mutate(row.id)}
                            >
                              Hiện
                            </button>
                          )}
                        </div>
                      )
                    }
                  ]}
                />
                <PaginationBar
                  page={list.page}
                  totalPages={list.totalPages}
                  total={list.total}
                  pageSize={list.pageSize}
                  onPageChange={list.setPage}
                  onPageSizeChange={list.setPageSize}
                />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={Boolean(pendingHide)}
        title="Ẩn danh mục"
        message={`"${pendingHide?.name || ""}" sẽ biến khỏi catalog công khai. Có thể hiện lại sau.`}
        confirmLabel="Ẩn"
        danger
        onCancel={() => setPendingHide(null)}
        onConfirm={() => {
          deactivate.mutate(pendingHide.id);
          setPendingHide(null);
        }}
      />
    </div>
  );
}

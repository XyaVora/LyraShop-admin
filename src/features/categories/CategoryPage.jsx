import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/api/adminApi.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import SearchField from "../../components/common/SearchField.jsx";
import SkeletonBlock from "../../components/common/SkeletonBlock.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import { parseApiError } from "../../services/api/errors.js";
import { slugify } from "../../utils/format.js";
import { filterRows } from "../../utils/filter.js";
import { useToastStore } from "../../store/toastStore.js";

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
  const [queryText, setQueryText] = useState("");
  const query = useQuery({
    queryKey: ["public", "categories"],
    queryFn: adminApi.listPublicCategories
  });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "", parentId: "" }
  });

  function invalidate() {
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

  const rows = filterRows(query.data || [], queryText, ["name", "slug"]);

  return (
    <div>
      <PageHeader
        title="Danh mục"
        crumbs={[{ label: "Tổng quan", to: "/" }, { label: "Danh mục" }]}
        description="Danh sách công khai chỉ gồm danh mục đang hiện."
      />
      <ErrorAlert problem={problem} />
      {query.isError && <ErrorAlert error={query.error} />}
      <div className="row g-4">
        <div className="col-lg-5">
          <form className="card card-body" onSubmit={form.handleSubmit(submit)}>
            <h2 className="h6">{editingId ? "Sửa danh mục" : "Tạo danh mục"}</h2>
            <input className="form-control mb-2" placeholder="Tên" {...form.register("name", {
              onChange: (event) => form.setValue("slug", slugify(event.target.value))
            })} />
            <input className="form-control mb-2" placeholder="Slug" {...form.register("slug")} />
            <textarea className="form-control mb-2" placeholder="Mô tả" {...form.register("description")} />
            <select className="form-select mb-3" {...form.register("parentId")}>
              <option value="">Không có danh mục cha</option>
              {(query.data || []).filter((item) => item.id !== editingId).map((item) => (
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
              <div className="mb-3">
                <SearchField value={queryText} onChange={setQueryText} placeholder="Tìm danh mục..." />
              </div>
              {query.isLoading ? <SkeletonBlock /> : (
                <DataTable
                  rows={rows}
                  rowKey={(row) => row.id}
                  emptyTitle="Chưa có danh mục hiện"
                  columns={[
                    { key: "name", header: "Tên" },
                    { key: "slug", header: "Slug" },
                    { key: "parentId", header: "Cha" },
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
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => deactivate.mutate(row.id)}
                          >
                            Ẩn
                          </button>
                        </div>
                      )
                    }
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

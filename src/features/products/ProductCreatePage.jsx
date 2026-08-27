import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api/adminApi.js";
import { parseApiError } from "../../services/api/errors.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";
import { slugify } from "../../utils/format.js";

const schema = z.object({
  name: z.string().trim().min(1).max(255),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug khong hop le"),
  description: z.string().max(2000).optional(),
  basePrice: z.coerce.number().min(0),
  categoryId: z.coerce.number().positive()
});

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [problem, setProblem] = useState(null);
  const categories = useQuery({
    queryKey: ["public", "categories"],
    queryFn: adminApi.listPublicCategories
  });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      basePrice: 0,
      categoryId: ""
    }
  });
  const mutation = useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      navigate(`/products/${created.id}`);
    },
    onError: (error) => setProblem(parseApiError(error))
  });

  return (
    <div className="col-lg-8">
      <h1 className="h4 mb-4">Tao san pham</h1>
      {categories.isError && <ErrorAlert error={categories.error} />}
      <ErrorAlert problem={problem} />
      <form
        className="card card-body"
        onSubmit={form.handleSubmit((values) => {
          setProblem(null);
          mutation.mutate(values);
        })}
        noValidate
      >
        <div className="mb-3">
          <label className="form-label" htmlFor="name">Ten</label>
          <input
            id="name"
            className="form-control"
            {...form.register("name", {
              onChange: (event) => {
                if (!form.getValues("slug") || form.getValues("slug") === slugify(form.getValues("name"))) {
                  form.setValue("slug", slugify(event.target.value));
                }
              }
            })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="slug">Slug</label>
          <input id="slug" className="form-control" {...form.register("slug")} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="description">Mo ta</label>
          <textarea id="description" className="form-control" rows={3} {...form.register("description")} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="basePrice">Gia co ban</label>
          <input id="basePrice" type="number" step="0.01" min="0" className="form-control" {...form.register("basePrice")} />
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="categoryId">Danh muc</label>
          <select id="categoryId" className="form-select" {...form.register("categoryId")}>
            <option value="">Chon danh muc</option>
            {(categories.data || []).map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-dark" disabled={mutation.isPending}>
          Luu san pham
        </button>
      </form>
    </div>
  );
}

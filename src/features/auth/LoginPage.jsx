import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useLocation } from "react-router-dom";
import { login } from "../../services/api/authApi.js";
import { parseApiError } from "../../services/api/errors.js";
import { useAuthStore } from "../../store/authStore.js";
import ErrorAlert from "../../components/common/ErrorAlert.jsx";

const schema = z.object({
  email: z.string().trim().email("Email khong hop le"),
  password: z.string().min(1, "Mat khau bat buoc")
});

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const location = useLocation();
  const [problem, setProblem] = useState(null);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  if (isAuthenticated) {
    const from = location.state?.from || "/";
    return <Navigate to={from} replace />;
  }

  async function onSubmit(values) {
    setProblem(null);
    try {
      await login(values);
    } catch (error) {
      if (error.code === "FORBIDDEN") {
        setProblem({
          status: 403,
          code: "FORBIDDEN",
          message: "Tai khoan khong co quyen ADMIN",
          fieldErrors: {}
        });
        return;
      }
      setProblem(parseApiError(error));
    }
  }

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-sm login-card">
        <div className="card-body p-4">
          <h1 className="h4 mb-1">LyraShop Admin</h1>
          <p className="text-secondary mb-4">Dang nhap bang tai khoan quan tri</p>
          <ErrorAlert problem={problem} />
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="form-control"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <div className="form-text text-danger">{form.formState.errors.email.message}</div>
              )}
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="password">Mat khau</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="form-control"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <div className="form-text text-danger">{form.formState.errors.password.message}</div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-dark w-100"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Dang nhap..." : "Dang nhap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

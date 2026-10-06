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
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu bắt buộc")
});

const DEMO_EMAIL = import.meta.env.VITE_DEMO_ADMIN_EMAIL || "";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "";

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const location = useLocation();
  const [problem, setProblem] = useState(null);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD
    }
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
          message: "Tài khoản không có quyền quản trị",
          fieldErrors: {}
        });
        return;
      }
      setProblem(parseApiError(error));
    }
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-logo">LYRA</div>
        <p className="login-visual-sub">
          Quản trị cửa hàng thời trang. Sản phẩm, đơn hàng và tài khoản trên cùng một hệ thống.
        </p>
      </div>
      <div className="login-form-col">
      <div className="card login-card">
        <div className="card-body">
          <div className="admin-sidebar-tag mb-3">Admin</div>
          <h1 className="page-title mb-1">Đăng nhập</h1>
          <p className="admin-page-sub mb-4">Dành cho quản trị viên LyraShop</p>
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
              <label className="form-label" htmlFor="password">Mật khẩu</label>
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
              className="btn btn-lyra w-100"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          {DEMO_EMAIL && (
            <p className="small text-secondary mt-3 mb-0">
              Tài khoản demo: {DEMO_EMAIL}
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

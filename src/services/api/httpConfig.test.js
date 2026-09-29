import { describe, expect, it } from "vitest";
import { CSRF_HEADER_NAME } from "../../utils/session.js";
import { api } from "./client.js";
import { API_TIMEOUT_MS, buildCredentialedRequest, isAuthRequest } from "./httpConfig.js";

describe("credentialed request builder", () => {
  it("uses a finite timeout so session restore cannot hang forever", () => {
    expect(API_TIMEOUT_MS).toBeGreaterThan(0);
    expect(API_TIMEOUT_MS).toBeLessThanOrEqual(8000);
    expect(api.defaults.timeout).toBe(API_TIMEOUT_MS);
  });

  it("recognizes auth requests by their logical backend path", () => {
    expect(isAuthRequest("/api/v1/auth/refresh")).toBe(true);
    expect(isAuthRequest("/api/v1/admin/dashboard")).toBe(false);
  });

  it("attaches credentials and CSRF on refresh", () => {
    const request = buildCredentialedRequest({
      method: "POST",
      path: "/api/v1/auth/refresh",
      accessToken: null,
      csrfToken: "csrf-token",
      body: undefined
    });
    expect(request.withCredentials).toBe(true);
    expect(request.method).toBe("POST");
    expect(request.url).toBe("/api/v1/auth/refresh");
    expect(request.headers[CSRF_HEADER_NAME]).toBe("csrf-token");
    expect(request.headers.Authorization).toBeUndefined();
  });

  it("never sends an expired Bearer token to CSRF or refresh endpoints", () => {
    for (const path of ["/api/v1/auth/csrf", "/api/v1/auth/refresh"]) {
      const request = buildCredentialedRequest({
        method: path.endsWith("csrf") ? "GET" : "POST",
        path,
        accessToken: "expired-access-token",
        csrfToken: "csrf-token"
      });
      expect(request.headers.Authorization).toBeUndefined();
    }
  });

  it("attaches Bearer plus CSRF on logout", () => {
    const request = buildCredentialedRequest({
      method: "POST",
      path: "/api/v1/auth/logout",
      accessToken: "access-abc",
      csrfToken: "csrf-token"
    });
    expect(request.withCredentials).toBe(true);
    expect(request.headers.Authorization).toBe("Bearer access-abc");
    expect(request.headers[CSRF_HEADER_NAME]).toBe("csrf-token");
  });

  it("sends Bearer without CSRF on admin mutations", () => {
    const request = buildCredentialedRequest({
      method: "POST",
      path: "/api/v1/admin/products",
      accessToken: "access-abc",
      csrfToken: "csrf-token",
      body: { name: "Ao" }
    });
    expect(request.withCredentials).toBe(true);
    expect(request.headers.Authorization).toBe("Bearer access-abc");
    expect(request.headers[CSRF_HEADER_NAME]).toBeUndefined();
    expect(request.headers["Content-Type"]).toBe("application/json");
  });

  it("lets the browser set a multipart boundary", () => {
    const request = buildCredentialedRequest({
      method: "POST",
      path: "/api/v1/admin/products/p1/images",
      accessToken: "access-abc",
      csrfToken: null,
      body: new FormData()
    });
    expect(request.headers["Content-Type"]).toBeUndefined();
    expect(request.headers.Authorization).toBe("Bearer access-abc");
  });
});

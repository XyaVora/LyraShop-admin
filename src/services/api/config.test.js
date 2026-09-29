import { describe, expect, it } from "vitest";
import { getApiRequestUrl } from "./config.js";

describe("admin API transport path", () => {
  it("maps backend API paths into the isolated admin proxy", () => {
    expect(getApiRequestUrl("/api/v1/auth/login", "/admin-api"))
      .toBe("/v1/auth/login");
    expect(getApiRequestUrl("/api/v1/admin/dashboard", "/admin-api"))
      .toBe("/v1/admin/dashboard");
  });

  it("keeps paths unchanged for an absolute backend origin", () => {
    expect(getApiRequestUrl("/api/v1/auth/login", "https://api.example.test"))
      .toBe("/api/v1/auth/login");
  });
});

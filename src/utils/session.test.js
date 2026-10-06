import { describe, expect, it, vi } from "vitest";
import { assertAdminAccessToken, createSessionFromLogin, persistAccessTokenToStorage } from "./session.js";

function jwtWithRoles(roles) {
  const encode = (value) => btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    sub: "11111111-1111-1111-1111-111111111111",
    roles,
    token_use: "access"
  })}.sig`;
}

describe("auth session handling", () => {
  it("keeps accessToken in the returned session and does not persist it to localStorage", () => {
    localStorage.clear();
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const accessToken = jwtWithRoles(["ADMIN"]);
    const session = createSessionFromLogin(
      { accessToken, tokenType: "Bearer", expiresIn: 900 },
      { "x-xsrf-token": "csrf-from-login" }
    );
    persistAccessTokenToStorage(localStorage, session.accessToken);

    expect(session.accessToken).toBe(accessToken);
    expect(session.csrfToken).toBe("csrf-from-login");
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.length).toBe(0);
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it("rejects a CUSTOMER token for admin screens", () => {
    expect(() => assertAdminAccessToken(jwtWithRoles(["CUSTOMER"]))).toThrow(/Admin role is required/);
    expect(assertAdminAccessToken(jwtWithRoles(["ADMIN"]))).toBe("ADMIN");
    expect(assertAdminAccessToken(jwtWithRoles(["CATALOG_MANAGER"]))).toBe("CATALOG_MANAGER");
    expect(assertAdminAccessToken(jwtWithRoles(["ORDER_MANAGER"]))).toBe("ORDER_MANAGER");
    expect(assertAdminAccessToken(jwtWithRoles(["SUPPORT"]))).toBe("SUPPORT");
  });
});

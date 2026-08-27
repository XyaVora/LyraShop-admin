import { decodeJwtPayload, isAdminRoleSet, readJwtRoles } from "./jwt.js";

export const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

export function readCsrfHeader(headers) {
  if (!headers) {
    return null;
  }
  if (typeof headers.get === "function") {
    return headers.get(CSRF_HEADER_NAME) || headers.get("x-xsrf-token") || null;
  }
  return (
    headers[CSRF_HEADER_NAME]
    || headers["x-xsrf-token"]
    || headers["X-Xsrf-Token"]
    || null
  );
}

export function createSessionFromLogin(loginResponse, headers) {
  if (!loginResponse || typeof loginResponse.accessToken !== "string") {
    throw new Error("Login response is missing accessToken");
  }
  return {
    accessToken: loginResponse.accessToken,
    tokenType: loginResponse.tokenType || "Bearer",
    expiresIn: loginResponse.expiresIn,
    csrfToken: readCsrfHeader(headers)
  };
}

export function persistAccessTokenToStorage(storage, accessToken) {
  void storage;
  void accessToken;
}

export function assertAdminAccessToken(accessToken) {
  const roles = readJwtRoles(accessToken);
  if (!isAdminRoleSet(roles)) {
    const error = new Error("Admin role is required");
    error.code = "FORBIDDEN";
    error.status = 403;
    throw error;
  }
  return roles[0];
}

export function sessionIdentity(accessToken) {
  const payload = decodeJwtPayload(accessToken);
  return {
    subject: payload.sub || null,
    role: assertAdminAccessToken(accessToken)
  };
}

export function emptyAuthState() {
  return {
    accessToken: null,
    csrfToken: null,
    role: null,
    subject: null
  };
}

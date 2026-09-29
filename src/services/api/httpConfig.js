import { CSRF_HEADER_NAME } from "../../utils/session.js";

export const API_TIMEOUT_MS = 5000;

const CSRF_PATHS = new Set([
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout"
]);

const BEARER_FREE_PATHS = new Set([
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/csrf",
  "/api/v1/auth/refresh"
]);

export function requestPath(url) {
  if (!url) {
    return "";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url.split("?")[0];
}

export function isAuthRequest(path) {
  return requestPath(path).startsWith("/api/v1/auth/");
}

export function pathRequiresCsrf(path) {
  return CSRF_PATHS.has(requestPath(path));
}

export function pathSkipsBearer(path) {
  return BEARER_FREE_PATHS.has(requestPath(path));
}

export function buildCredentialedRequest({
  method,
  path,
  accessToken,
  csrfToken,
  body
}) {
  const headers = {
    Accept: "application/json"
  };
  const isMultipart = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken && !pathSkipsBearer(path)) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (csrfToken && pathRequiresCsrf(path)) {
    headers[CSRF_HEADER_NAME] = csrfToken;
  }
  return {
    method,
    url: path,
    headers,
    withCredentials: true,
    data: body
  };
}

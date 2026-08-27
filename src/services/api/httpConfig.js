import { CSRF_HEADER_NAME } from "../../utils/session.js";

export const API_TIMEOUT_MS = 5000;

const CSRF_PATHS = new Set([
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout"
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

export function pathRequiresCsrf(path) {
  return CSRF_PATHS.has(requestPath(path));
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
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) {
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

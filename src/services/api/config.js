export function getApiBaseUrl() {
  const value = import.meta.env.VITE_API_URL;
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim().replace(/\/$/, "");
  }
  return "/admin-api";
}

export function getApiRequestUrl(url, baseUrl = getApiBaseUrl()) {
  if (baseUrl === "/admin-api" && typeof url === "string" && url.startsWith("/api/")) {
    return url.slice(4);
  }
  return url;
}

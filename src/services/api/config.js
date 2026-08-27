export function getApiBaseUrl() {
  const value = import.meta.env.VITE_API_URL;
  if (typeof value === "string" && value.trim() !== "") {
    return value.replace(/\/$/, "");
  }
  return "http://localhost:8080";
}

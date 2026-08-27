import axios from "axios";
import { getApiBaseUrl } from "./config.js";
import { buildCredentialedRequest, requestPath } from "./httpConfig.js";
import { useAuthStore } from "../../store/authStore.js";
import { readCsrfHeader } from "../../utils/session.js";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const { accessToken, csrfToken } = useAuthStore.getState();
  const path = requestPath(config.url);
  const built = buildCredentialedRequest({
    method: (config.method || "get").toUpperCase(),
    path,
    accessToken,
    csrfToken,
    body: config.data
  });
  config.withCredentials = true;
  config.headers = {
    ...config.headers,
    ...built.headers
  };
  return config;
});

api.interceptors.response.use(
  (response) => {
    const csrfToken = readCsrfHeader(response.headers);
    if (csrfToken) {
      useAuthStore.getState().setCsrfToken(csrfToken);
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    if (!original || original._retry) {
      return Promise.reject(error);
    }
    const status = error.response?.status;
    const path = requestPath(original.url);
    const isAuthMutation = path.startsWith("/api/v1/auth/");
    if (status === 401 && !isAuthMutation) {
      original._retry = true;
      const { restoreSession } = await import("./authApi.js");
      await restoreSession();
      return api(original);
    }
    return Promise.reject(error);
  }
);

export function requestEndpoint(endpoint, data) {
  return api.request({
    method: endpoint.method,
    url: endpoint.path,
    data
  });
}

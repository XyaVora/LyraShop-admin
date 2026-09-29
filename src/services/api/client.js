import axios from "axios";
import { getApiBaseUrl, getApiRequestUrl } from "./config.js";
import {
  API_TIMEOUT_MS,
  buildCredentialedRequest,
  isAuthRequest,
  requestPath
} from "./httpConfig.js";
import { useAuthStore } from "../../store/authStore.js";
import { readCsrfHeader } from "../../utils/session.js";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: API_TIMEOUT_MS
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = import("./authApi.js")
      .then(({ restoreSession }) => restoreSession())
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const { accessToken, csrfToken } = useAuthStore.getState();
  // Keep the backend path because the dev proxy rewrites config.url. Response
  // handling and retries still need to know that /v1/auth/refresh is the
  // logical /api/v1/auth/refresh endpoint.
  const path = config._logicalPath || requestPath(config.url);
  config._logicalPath = path;
  const built = buildCredentialedRequest({
    method: (config.method || "get").toUpperCase(),
    path,
    accessToken,
    csrfToken,
    body: config.data
  });
  config.withCredentials = true;
  config.url = getApiRequestUrl(config.url, config.baseURL);
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
    const path = original._logicalPath || requestPath(original.url);
    if (status === 401 && !isAuthRequest(path)) {
      original._retry = true;
      await refreshAccessToken();
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

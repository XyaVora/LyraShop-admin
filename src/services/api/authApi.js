import { api, requestEndpoint } from "./client.js";
import { authEndpoints, loginBody } from "./endpoints.js";
import {
  assertAdminAccessToken,
  createSessionFromLogin,
  persistAccessTokenToStorage
} from "../../utils/session.js";
import { useAuthStore } from "../../store/authStore.js";

const endpoints = authEndpoints();
let restorePromise = null;

async function logoutCurrentSession() {
  try {
    await requestEndpoint(endpoints.logout);
  } catch {
    // Cookie/session may already be invalid.
  } finally {
    useAuthStore.getState().clear();
  }
}

export async function login(credentials) {
  persistAccessTokenToStorage(
    typeof localStorage === "undefined" ? null : localStorage,
    null
  );
  const response = await requestEndpoint(endpoints.login, loginBody(credentials));
  const session = createSessionFromLogin(response.data, response.headers);
  useAuthStore.getState().hydrateTokens(session);
  try {
    assertAdminAccessToken(session.accessToken);
  } catch (error) {
    await logoutCurrentSession();
    throw error;
  }
  useAuthStore.getState().applySession(session);
  return session;
}

async function restoreCurrentSession() {
  try {
    const csrfResponse = await requestEndpoint(endpoints.csrf);
    const csrfToken = csrfResponse.headers?.["x-xsrf-token"]
      || csrfResponse.headers?.["X-XSRF-TOKEN"];
    if (csrfToken) {
      useAuthStore.getState().setCsrfToken(csrfToken);
    }
    const response = await requestEndpoint(endpoints.refresh);
    const session = createSessionFromLogin(response.data, response.headers);
    useAuthStore.getState().hydrateTokens(session);
    try {
      assertAdminAccessToken(session.accessToken);
    } catch (error) {
      await logoutCurrentSession();
      throw error;
    }
    useAuthStore.getState().applySession(session);
    return session;
  } catch (error) {
    useAuthStore.getState().clear();
    throw error;
  }
}

export function restoreSession() {
  if (!restorePromise) {
    restorePromise = restoreCurrentSession().finally(() => {
      restorePromise = null;
    });
  }
  return restorePromise;
}

export async function logout() {
  await logoutCurrentSession();
}

export { api };

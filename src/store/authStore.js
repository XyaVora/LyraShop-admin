import { create } from "zustand";
import {
  assertAdminAccessToken,
  emptyAuthState,
  persistAccessTokenToStorage,
  sessionIdentity
} from "../utils/session.js";

export const useAuthStore = create((set, get) => ({
  ...emptyAuthState(),
  hydrateTokens(session) {
    persistAccessTokenToStorage(
      typeof localStorage === "undefined" ? null : localStorage,
      session.accessToken
    );
    set({
      accessToken: session.accessToken,
      csrfToken: session.csrfToken ?? get().csrfToken
    });
  },
  applySession(session) {
    persistAccessTokenToStorage(
      typeof localStorage === "undefined" ? null : localStorage,
      session.accessToken
    );
    const identity = sessionIdentity(session.accessToken);
    set({
      accessToken: session.accessToken,
      csrfToken: session.csrfToken ?? get().csrfToken,
      role: identity.role,
      subject: identity.subject
    });
  },
  setCsrfToken(csrfToken) {
    if (csrfToken) {
      set({ csrfToken });
    }
  },
  clear() {
    set(emptyAuthState());
  },
  isAuthenticated() {
    return Boolean(get().accessToken) && get().role === "ADMIN";
  }
}));

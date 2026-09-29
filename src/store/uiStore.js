import { create } from "zustand";

function saved(key, fallback) {
  if (typeof localStorage === "undefined") return fallback;
  return localStorage.getItem(key) || fallback;
}

export const useUiStore = create((set) => ({
  theme: saved("lyra-admin-theme", "light"),
  density: saved("lyra-admin-density", "comfortable"),
  setTheme(theme) {
    localStorage.setItem("lyra-admin-theme", theme);
    set({ theme });
  },
  setDensity(density) {
    localStorage.setItem("lyra-admin-density", density);
    set({ density });
  }
}));

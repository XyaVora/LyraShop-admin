import { create } from "zustand";

let nextId = 1;

export const useToastStore = create((set) => ({
  items: [],
  push(message, tone = "success") {
    const id = nextId++;
    set((state) => ({
      items: [...state.items, { id, message, tone }]
    }));
    window.setTimeout(() => {
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    }, 3200);
  },
  dismiss(id) {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  }
}));

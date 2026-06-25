import { create } from 'zustand';

export const useCompareStore = create((set, get) => ({
  products: [],

  toggle: (product) => {
    const { products } = get();
    const exists = products.some((p) => p._id === product._id);
    if (exists) {
      set({ products: products.filter((p) => p._id !== product._id) });
      return false;
    }
    if (products.length >= 2) return false; // already at max
    set({ products: [...products, product] });
    return true;
  },

  remove: (id) => set((s) => ({ products: s.products.filter((p) => p._id !== id) })),

  clear: () => set({ products: [] }),

  isInCompare: (id) => get().products.some((p) => p._id === id),
}));

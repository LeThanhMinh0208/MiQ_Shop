import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [], // mảng product objects để hiển thị offline

            toggle: (product) => {
                const items = get().items;
                const exists = items.some((i) => i._id === product._id);
                set({
                    items: exists
                        ? items.filter((i) => i._id !== product._id)
                        : [...items, product],
                });
                return !exists; // true = vừa thêm, false = vừa xóa
            },

            removeById: (id) =>
                set({ items: get().items.filter((i) => i._id !== id) }),

            isWishlisted: (id) => get().items.some((i) => i._id === id),

            getCount: () => get().items.length,

            // Dùng khi sync từ server về local (login)
            setItems: (items) => set({ items }),
        }),
        { name: 'miq-wishlist' }
    )
);

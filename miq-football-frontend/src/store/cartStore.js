import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart store với localStorage persist
export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, size, quantity = 1) => {
                const items = get().items;
                const existing = items.find(
                    (i) => i.productId === product._id && i.size === size
                );

                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.productId === product._id && i.size === size ? {...i, quantity: i.quantity + quantity } :
                            i
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                productId: product._id,
                                name: product.name,
                                price: product.salePrice || product.price,
                                image: (product.images && product.images[0] && product.images[0].url) || '',
                                size,
                                quantity,
                            },
                        ],
                    });
                }
            },

            removeItem: (productId, size) => {
                set({
                    items: get().items.filter(
                        (i) => !(i.productId === productId && i.size === size)
                    ),
                });
            },

            updateQuantity: (productId, size, quantity) => {
                if (quantity <= 0) return get().removeItem(productId, size);
                set({
                    items: get().items.map((i) =>
                        i.productId === productId && i.size === size ? {...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set({ isOpen: !get().isOpen }),

            // Computed: tổng tiền và số lượng
            getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
            getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }), { name: 'miq-cart-storage' } // Lưu vào localStorage
    )
);
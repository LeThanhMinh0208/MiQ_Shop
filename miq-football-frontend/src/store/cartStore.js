import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const genId = () => Math.random().toString(36).slice(2, 10);

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            // Not persisted — tracks whether the persist layer has finished
            // reading from localStorage so Checkout.jsx doesn't redirect to
            // /cart before the cart is actually empty.
            _hasHydrated: false,
            setHasHydrated: (v) => set({ _hasHydrated: v }),

            addItem: (product, size, quantity = 1, customization = null) => {
                const items    = get().items;
                const hasCustom = !!(customization && (customization.name || customization.number));
                const basePrice = product.salePrice || product.price;
                const price     = basePrice + (hasCustom ? 50_000 : 0);

                // Merge identical non-customized items
                if (!hasCustom) {
                    const idx = items.findIndex(
                        (i) => i.productId === product._id && i.size === size && !i.customization
                    );
                    if (idx >= 0) {
                        const next = [...items];
                        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
                        set({ items: next });
                        return;
                    }
                }

                set({
                    items: [
                        ...items,
                        {
                            cartItemId:    genId(),
                            productId:     product._id,
                            name:          product.name,
                            brand:         product.brand || '',
                            price,
                            image:         (product.images && product.images[0] && product.images[0].url) || '',
                            size,
                            quantity,
                            customization: hasCustom ? customization : null,
                        },
                    ],
                });
            },

            removeItem: (cartItemId) => {
                set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
            },

            updateQuantity: (cartItemId, quantity) => {
                if (quantity <= 0) return get().removeItem(cartItemId);
                set({
                    items: get().items.map((i) =>
                        i.cartItemId === cartItemId ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set({ isOpen: !get().isOpen }),

            getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
            getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        {
            name: 'miq-cart-storage',
            // Only persist the shopping-cart data, not the hydration flag or actions.
            partialize: (state) => ({ items: state.items, isOpen: state.isOpen }),
            onRehydrateStorage: () => (state) => {
                // Migrate old items that lack cartItemId or brand
                if (state?.items) {
                    state.items = state.items.map((item) => ({
                        brand: '',
                        ...item,
                        cartItemId: item.cartItemId || genId(),
                    }));
                }
                // Signal that localStorage has been read — Checkout.jsx waits for
                // this before deciding the cart is truly empty.
                state?.setHasHydrated(true);
            },
        }
    )
);

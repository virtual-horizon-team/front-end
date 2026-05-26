import { create } from 'zustand';
import { getCartCount, getCart, addToCart, removeFromCart } from '../services/cart.service';
import { CartViewResponseDto } from '../types/cart';

interface CartState {
  count: number;
  cart: CartViewResponseDto | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCount: () => Promise<void>;
  fetchCart: () => Promise<void>;
  addItem: (courseId: string) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  count: 0,
  cart: null,
  isLoading: false,
  error: null,

  fetchCount: async () => {
    try {
      const response = await getCartCount();
      if (response.success && response.data) {
        set({ count: response.data.count });
      }
    } catch (err: any) {
      console.error('Failed to fetch cart count', err);
    }
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCart();
      if (response.success && response.data) {
        set({ cart: response.data, count: response.data.summary.itemCount, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch cart', isLoading: false });
      }
    } catch (err: any) {
      if (err.message?.includes('404')) {
        // User has no cart yet
        set({ cart: null, count: 0, isLoading: false });
      } else {
        set({ error: err.message || 'Failed to fetch cart', isLoading: false });
      }
    }
  },

  addItem: async (courseId: string) => {
    // Optimistic update
    const previousCount = get().count;
    set({ count: previousCount + 1 });
    
    try {
      const response = await addToCart(courseId);
      if (!response.success) {
        set({ count: previousCount }); // revert
        throw new Error(response.message || 'Failed to add item');
      }
      // Re-fetch count/cart if needed, or assume count + 1 is correct.
      // Getting full cart to ensure consistency if we are on cart page.
      get().fetchCart();
    } catch (err: any) {
      set({ count: previousCount }); // revert
      throw err;
    }
  },

  removeItem: async (cartItemId: string) => {
    // Optimistic update logic
    const { cart, count } = get();
    if (!cart) return;

    const previousCart = { ...cart };
    const previousCount = count;
    
    const updatedItems = cart.items.filter(item => item.cartItemId !== cartItemId);
    const removedItem = cart.items.find(item => item.cartItemId === cartItemId);
    
    if (!removedItem) return;

    const newTotalPrice = cart.summary.totalPrice - (removedItem.price || 0);

    set({
      cart: {
        ...cart,
        items: updatedItems,
        summary: {
          ...cart.summary,
          itemCount: updatedItems.length,
          totalPrice: newTotalPrice
        }
      },
      count: updatedItems.length
    });

    try {
      const response = await removeFromCart(cartItemId);
      if (!response.success) {
        // revert
        set({ cart: previousCart, count: previousCount });
        throw new Error(response.message || 'Failed to remove item');
      }
      get().fetchCart();
    } catch (err: any) {
      set({ cart: previousCart, count: previousCount });
      throw err;
    }
  }
}));

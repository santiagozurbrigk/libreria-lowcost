import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image_url?: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product: Omit<CartItem, 'quantity'>) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          // Si ya existe, aumentar cantidad
          if (existingItem.quantity < product.stock) {
            set({
              items: items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            });
          }
        } else {
          // Si no existe, agregar nuevo item
          set({
            items: [...items, { ...product, quantity: 1 }],
          });
        }
      },
      
      removeItem: (id: string) => {
        set({
          items: get().items.filter(item => item.id !== id),
        });
      },
      
      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        const items = get().items;
        const item = items.find(item => item.id === id);
        
        if (item && quantity <= item.stock) {
          set({
            items: items.map(item =>
              item.id === id ? { ...item, quantity } : item
            ),
          });
        }
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

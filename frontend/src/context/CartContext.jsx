import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cart_items";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    function addToCart(product, quantity = 1) {
      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === product.id);
        if (existingItem) {
          return currentItems.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }

        return [...currentItems, { ...product, quantity }];
      });
    }

    function updateQuantity(productId, quantity) {
      setItems((currentItems) =>
        currentItems
          .map((item) => (item.id === productId ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0),
      );
    }

    function removeFromCart(productId) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
    }

    function clearCart() {
      setItems([]);
    }

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

    return { items, itemCount, subtotal, addToCart, updateQuantity, removeFromCart, clearCart };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}

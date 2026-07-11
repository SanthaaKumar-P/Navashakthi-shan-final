import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "./mock-data";

interface CartItem { product: Product; qty: number }

interface CartContextValue {
  items: CartItem[];
  wishlist: string[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("navshakthi_cart");
      const w = localStorage.getItem("navshakthi_wishlist");
      if (c) setItems(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("navshakthi_cart", JSON.stringify(items));
    localStorage.setItem("navshakthi_wishlist", JSON.stringify(wishlist));
  }, [items, wishlist, hydrated]);

  const add: CartContextValue["add"] = (p, qty = 1) =>
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { product: p, qty }];
    });
  const remove = (id: string) => setItems((p) => p.filter((i) => i.product.id !== id));
  const updateQty = (id: string, qty: number) =>
    setItems((p) => p.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);
  const toggleWishlist = (id: string) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const inWishlist = (id: string) => wishlist.includes(id);

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, wishlist, add, remove, updateQty, clear, toggleWishlist, inWishlist, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

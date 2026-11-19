import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('ss_cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product_id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { product_id: product.id, quantity: qty, price: product.price, name: product.name, image: product.image }];
    });
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  }

  function updateQty(productId, qty) {
    if (qty < 1) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: qty } : i));
  }

  function clearCart() { setCart([]); }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }

import { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'productosCarrito';

export const useCart = () => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        return prevCart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, cantidad: 1 }];
      }
    });
  };

  const setItemQuantity = (productId, newQuantity) => {
    setCart(prevCart => {
        if (newQuantity <= 0) {
            return prevCart.filter(item => item.id !== productId);
        }
        return prevCart.map(item => 
            item.id === productId ? { ...item, cantidad: newQuantity } : item
        );
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const totals = useMemo(() => {
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    const subTotal = cart.reduce((acc, item) => acc + (item.cantidad * item.price), 0);
    
    const tax = 0;
    const finalTotal = subTotal;

    return { totalItems, subTotal, tax, finalTotal };
  }, [cart]);

  const processCheckout = () => {
    if (cart.length > 0) {
        localStorage.setItem('lastPurchasedCart', JSON.stringify(cart));
        localStorage.setItem('lastPurchasedTotals', JSON.stringify(totals));
        setCart([]);
        return true;
    }
    return false;
  };

  return {
    cart,
    ...totals,
    addToCart,
    setItemQuantity,
    removeFromCart,
    processCheckout,
  };
};
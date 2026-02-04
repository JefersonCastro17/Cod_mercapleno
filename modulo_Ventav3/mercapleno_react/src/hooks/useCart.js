// src/hooks/useCart.js

import { useState, useEffect, useMemo } from 'react';
import { sendOrder } from '../services/productData'; // ¡Importante: asegúrate de que exista en productData.js!

const STORAGE_KEY = 'productosCarrito';

export const useCart = () => {
  // --- ESTADO Y PERSISTENCIA DEL CARRITO ---
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error cargando carrito de localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    // Guarda el carrito en localStorage cada vez que cambia
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);
  // --------------------------------------------------------------------------


  // --- FUNCIONES DE MANEJO DEL CARRITO ---
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
        // Aseguramos que el producto tiene la cantidad inicial de 1
        return [...prevCart, { ...product, cantidad: 1 }]; 
      }
    });
  };

  const setItemQuantity = (productId, newQuantity) => {
    setCart(prevCart => {
        if (newQuantity <= 0) {
            // Eliminar producto si la cantidad es 0 o menos
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
  
  // --- CÁLCULO DE TOTALES (Usa 'cart') ---
  const totals = useMemo(() => {
    // Asegúrate de que los campos 'price' y 'cantidad' existan
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    const subTotal = cart.reduce((acc, item) => acc + (item.cantidad * item.price), 0);
    
    // Aquí puedes calcular el IVA (tax) si lo deseas
    const tax = 0; 
    const finalTotal = subTotal;

    return { totalItems, subTotal, tax, finalTotal };
  }, [cart]);

  // --- FUNCIÓN DE CHECKOUT (Usa 'cart' y 'sendOrder') ---
  const processCheckout = async () => { 
    if (cart.length > 0) {
        
        // 1. Prepara los datos para el backend
        const orderData = {
            items: cart.map(item => ({
                id: item.id,
                cantidad: item.cantidad
            })),
            total: totals.finalTotal
        };

        // 2. Envía la orden al API
        const result = await sendOrder(orderData); 

        if (result.success) {
            // 3. Si la orden se registró con éxito en la BD:
            localStorage.setItem('lastPurchasedCart', JSON.stringify(cart));
            localStorage.setItem('lastPurchasedTotals', JSON.stringify(totals));
            setCart([]); // Vacía el carrito local
            
            return true;
        } else {
            // 4. Muestra un error si el API falló (ej: stock insuficiente)
            alert(`Error al procesar el pago: ${result.message}`);
            return false;
        }

    }
    return false;
  };

  // --- VALORES DEVUELTOS POR EL HOOK ---
  return {
    cart,
    setCart,
    addToCart,
    setItemQuantity,
    removeFromCart,
    totalItems: totals.totalItems,
    subTotal: totals.subTotal,
    finalTotal: totals.finalTotal,
    processCheckout,
  };
};
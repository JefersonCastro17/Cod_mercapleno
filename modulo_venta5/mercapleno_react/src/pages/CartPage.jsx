import React from 'react';
import { useCartContext } from '../context/CartContext';
import CartItem from '../components/ui/CartItem';
import TotalsSummary from '../components/features/TotalsSummary';
import SuggestedProducts from '../components/features/SuggestedProducts'; 

function CartPage({ onNavigate }) {
  const { cart, removeFromCart, totalItems } = useCartContext();

  const handleClearCart = () => {
    if (window.confirm("¿Estás seguro que deseas vaciar todo el carrito?")) {
      cart.forEach(item => removeFromCart(item.id));
    }
  };

  return (
    <main className="carrito-main">
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Tu Carrito de Compras</h1>
      
      {totalItems === 0 ? (
        <div id="carrito-vacio-msg" className="mensaje-vacio">
          <p>Tu carrito está vacio</p>
          <button className="boton-nav" onClick={() => onNavigate('inventory')}>
            explorar productos
          </button>
          <SuggestedProducts /> 
        </div>
      ) : (
        <>
          <section id="productos-carrito-container" className="productos-carrito-container">
            {cart.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </section>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
            <button id="btn-vaciar" className="boton-nav" onClick={handleClearCart} style={{ backgroundColor: '#dc3545' }}>
              Vaciar Carrito
            </button>
          </div>
          
          <TotalsSummary onNavigate={onNavigate} />
          <SuggestedProducts />
        </>
      )}
    </main>
  );
}

export default CartPage;
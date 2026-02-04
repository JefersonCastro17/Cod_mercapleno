import React from 'react';
import { useCartContext } from '../../context/CartContext';

function Header({ currentPage, onNavigate }) {
  const { totalItems } = useCartContext();

  return (
    <header>
      <nav className="barra-navegacion">
        <div className="texto-logo">Mercapleno</div>
        <div className="contenedor-botones">
          <button 
            className="boton-nav" 
            onClick={() => onNavigate('inventory')} 
            style={{ 
              backgroundColor: currentPage === 'inventory' ? '#073B74' : '#F9B300',
              color: currentPage === 'inventory' ? 'white' : 'black'
            }}
          >
            Catálogo
          </button>
          <button 
            className="boton-nav" 
            onClick={() => onNavigate('cart')}
            style={{ 
              backgroundColor: currentPage === 'cart' ? '#073B74' : '#F9B300',
              color: currentPage === 'cart' ? 'white' : 'black'
            }}
          >
            Carrito ({totalItems})
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
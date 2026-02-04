import React from 'react';
import { useCartContext } from '../../context/CartContext';
import { formatPrice } from '../../services/productData';

function TotalsSummary({ onNavigate }) { 
  const { subTotal, finalTotal, processCheckout } = useCartContext();

  // Función ahora ASÍNCRONA para esperar la respuesta del API
  const handleCheckout = async () => { // <--- AÑADE 'async'
    if (window.confirm("¿Confirmar la compra?")) {
      const success = await processCheckout(); // <--- AÑADE 'await'
      if (success) {
        onNavigate('ticket');
      }
    }
  };

  return (
    <section id="totales-container" className="totales-container">
      <div className="summary-box">
        <h2 className="title">Resumen de la Compra</h2>
        <div className="summary">
            <div className="fila">
                <span>Subtotal:</span>
                <span>{formatPrice(subTotal)}</span>
            </div>
            
            <hr />
            <div className="total">
                <span>Total Final:</span>
                <span>{formatPrice(finalTotal)}</span>
            </div>
        </div>
        <button 
          className="pay boton-nav"
          onClick={handleCheckout}
        >
          Pagar y Generar Ticket
        </button>
      </div>
    </section>
  );
}

export default TotalsSummary;
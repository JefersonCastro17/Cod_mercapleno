
import React, { useEffect, useState } from 'react';
import { formatPrice } from '../services/productData';

function TicketPage({ onBackToInventory }) {
  const [ticketData, setTicketData] = useState(null);
  
  useEffect(() => {

    const finalCartJSON = localStorage.getItem('lastPurchasedCart');
    const finalTotalsJSON = localStorage.getItem('lastPurchasedTotals');

    if (finalCartJSON && finalTotalsJSON) {
        setTicketData({
            cart: JSON.parse(finalCartJSON),
            totals: JSON.parse(finalTotalsJSON),

            date: new Date().toLocaleDateString('es-CO'),
            ticketNumber: Math.floor(Math.random() * 1000) + 100,
            name: 'Cliente Ejemplo', 
            email: 'cliente@ejemplo.com'
        });
   
        localStorage.removeItem('lastPurchasedCart');
        localStorage.removeItem('lastPurchasedTotals');
    }
    
  }, []);

  if (!ticketData) {
    return <p style={{textAlign: 'center', margin: '50px'}}>Generando ticket...</p>;
  }

  return (
    <>
      <h1 className="titulo-principal">Ticket de compra</h1>

      <div className="caja-ticket">
        <p><strong>Nombre:</strong> {ticketData.name}</p>
        <p><strong>Correo:</strong> {ticketData.email}</p>
        <p><strong>Fecha:</strong> {ticketData.date}</p>
        <p><strong>Número de ticket:</strong> {ticketData.ticketNumber}</p>

        <p><strong>Productos:</strong></p>
        <div className="detalle-productos">
            {ticketData.cart.map(item => (
                <p key={item.id}>
                    {item.name} ({item.cantidad} unid.) 
                    <span className="alinear-derecha">{formatPrice(item.price * item.cantidad)}</span>
                </p>
            ))}
        </div>

        <hr />
        <p><strong>Subtotal</strong> <span className="alinear-derecha">{formatPrice(ticketData.totals.subTotal)}</span></p>
        <p><strong>IVA</strong> <span className="alinear-derecha">{formatPrice(ticketData.totals.tax)}</span></p>
        <hr />
        <p className="total-ticket"><strong>Total</strong> <span className="alinear-derecha">{formatPrice(ticketData.totals.finalTotal)}</span></p>
        
        <div style={{textAlign: 'center', marginTop: '20px'}}>
            <button className="boton-nav" onClick={onBackToInventory}>Volver al Catálogo</button>
        </div>
      </div>
    </>
  );
}

export default TicketPage;
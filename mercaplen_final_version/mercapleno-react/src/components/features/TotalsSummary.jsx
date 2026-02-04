// 🟢 src/components/features/TotalsSummary.jsx (CORREGIDO para eliminar WARNING)

import React from 'react';
// 🚨 ELIMINAR ESTA IMPORTACIÓN: Ya no se usa dentro de este componente.
// import { formatPrice } from '../../services/productData'; 

// 🚨 CAMBIO CLAVE: TotalsSummary recibe todas las props necesarias
function TotalsSummary({ totals, formatPrice, onCheckout, isProcessing, totalItems }) { 
    
    // Eliminamos la función handleCheckout de aquí, ya que el padre la manejará.
    // Eliminamos la desestructuración del hook: const { subTotal, finalTotal, processCheckout } = useCartContext(); 

    return (
        <section id="totales-container" className="totales-container">
            <div className="summary-box">
                <h2 className="title">Resumen de la Compra</h2>
                <div className="summary">
                    <div className="fila">
                        <span>Subtotal:</span>
                        <span>{formatPrice(totals.subTotal)}</span>
                    </div>
                    
                    <hr />
                    <div className="total">
                        <span>Total Final:</span>
                        <span>{formatPrice(totals.finalTotal)}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TotalsSummary;
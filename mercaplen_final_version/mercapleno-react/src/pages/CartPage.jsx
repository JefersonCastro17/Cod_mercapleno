import React, { useState, useMemo } from 'react'; 
// 🚨 CAMBIO 1: Importamos useNavigate de react-router-dom
import { useNavigate } from 'react-router-dom'; 
import { useCartContext } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext'; 
import CartItem from '../components/ui/CartItem';
import TotalsSummary from '../components/features/TotalsSummary'; 
import SuggestedProducts from '../components/features/SuggestedProducts'; 
import { formatPrice } from '../services/productData'; 

import "../styles/base.css";
import "../styles/cart.css";

const PAYMENT_METHODS = [
    { id: 1, name: 'Efectivo', dbId: 'M1' }, 
    { id: 2, name: 'Tarjeta de Crédito', dbId: 'M2' },
    { id: 3, name: 'Tarjeta de Débito', dbId: 'M3' }, 
    { id: 4, name: 'Transferencia', dbId: 'M4' }, 
    { id: 5, name: 'Nequi', dbId: 'M5' }, 
    { id: 6, name: 'Daviplata', dbId: 'M6' },
];

// 🚨 CAMBIO 2: Ya no necesitamos recibir 'onNavigate' como prop
function CartPage() {
    // 🚨 CAMBIO 3: Inicializamos el hook de navegación
    const navigate = useNavigate(); 
    
    const { cart, removeFromCart, totalItems, clearCart, processCheckout } = useCartContext(); 
    const { isAuthenticated, getUserId } = useAuthContext();
    
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0].dbId);
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);

    const totals = useMemo(() => {
        const subTotalCents = cart.reduce((sum, item) => sum + (Math.round(item.price * 100) * item.cantidad), 0);
        const subTotal = subTotalCents / 100;
        const taxRate = 0.19; 
        const taxCents = Math.round(subTotalCents * taxRate);
        const tax = taxCents / 100;
        const finalTotalCents = subTotalCents + taxCents;
        const finalTotal = finalTotalCents / 100;
        return { subTotal, tax, finalTotal };
    }, [cart]);

    const handleCheckout = async () => {
        if (cart.length === 0) { 
            setCheckoutError("Tu carrito está vacío.");
            return; 
        }

        const id_usuario = getUserId(); 
        if (!isAuthenticated || !id_usuario) {
            setCheckoutError("Debes iniciar sesión para completar la compra.");
            return;
        }

        setIsProcessing(true); 
        setCheckoutError(null);
        
        try {
            const result = await processCheckout(selectedPaymentMethod); 
            
            if (result && (result.id_venta || result.ticketId)) { 
                localStorage.setItem('lastPurchasedCart', JSON.stringify(cart));
                localStorage.setItem('lastPurchasedTotals', JSON.stringify({ 
                    ...totals, 
                    ticketId: result.ticketId || result.id_venta || 'N/A', 
                    paymentMethod: PAYMENT_METHODS.find(m => m.dbId === selectedPaymentMethod)?.name || 'Desconocido'
                })); 
                
                clearCart(); 
                // 🚨 CAMBIO 4: Usamos navigate('/ticket') en lugar de onNavigate
                navigate('/ticket'); 
            } else {
                setCheckoutError("Error al procesar la compra.");
            }
        } catch (error) {
            setCheckoutError(error.message || "Error grave al procesar el pago.");
        } finally {
            setIsProcessing(false); 
        }
    };

    return (
        <main className="carrito-main">
            <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Tu Carrito de Compras</h1>
            
            {totalItems === 0 ? (
                <div className="mensaje-vacio">
                    <p>Tu carrito está vacío</p>
                    {/* 🚨 CAMBIO 5: Usamos navigate('/catalogo') */}
                    <button className="boton-nav" onClick={() => navigate('/catalogo')}>
                        Explorar productos
                    </button>
                    <SuggestedProducts /> 
                </div>
            ) : (
                <div className="carrito-content-grid">
                    <section className="productos-carrito-container">
                        {cart.map(item => <CartItem key={item.id} item={item} />)}
                    </section>
                    
                    <section className="resumen-pago-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                            <button className="boton-nav" onClick={() => { if(window.confirm("¿Vaciar?")) clearCart(); }} style={{ backgroundColor: '#dc3545' }}>
                                Vaciar Carrito
                            </button>
                            {/* 🚨 CAMBIO 6: Usamos navigate('/catalogo') */}
                            <button className="boton-nav" onClick={() => navigate('/catalogo')}>
                                Seguir comprando
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                                Método de Pago:
                            </label>
                            <select 
                                value={selectedPaymentMethod} 
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                style={{ width: '100%', padding: '10px' }}
                                disabled={isProcessing}
                            >
                                {PAYMENT_METHODS.map(method => (
                                    <option key={method.dbId} value={method.dbId}>{method.name}</option> 
                                ))}
                            </select>
                        </div>

                        <TotalsSummary totals={totals} formatPrice={formatPrice} /> 

                        {checkoutError && <p style={{ color: 'red', textAlign: 'center' }}>{checkoutError}</p>}

                        <button 
                            className="boton-nav" 
                            onClick={handleCheckout} 
                            disabled={isProcessing}
                            style={{ backgroundColor: '#28a745', width: '100%', marginTop: '15px' }}
                        >
                            {isProcessing ? 'Procesando...' : `Pagar ${formatPrice(totals.finalTotal)}`}
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}

export default CartPage;
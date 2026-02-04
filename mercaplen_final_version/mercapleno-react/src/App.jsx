// 🟢 src/App.js (VERSIÓN CORREGIDA PARA USAR ROUTER EN INDEX.JS)

import React from 'react';
// ⚠️ NO importamos BrowserRouter, Routes, Route, useNavigate aquí.
import { Routes, Route, useNavigate } from 'react-router-dom';

// Importamos el CartProvider y AuthContext (ya estás usando AuthProvider en index.js)
import { CartProvider } from './context/CartContext'; 
import { useAuthContext } from './context/AuthContext'; 

// Importación de Componentes de Página
import Header from './components/ui/Header'; 
import InventoryPage from './pages/InventoryPage'; 
import CartPage from './pages/CartPage';        
import TicketPage from './pages/TicketPage';    
import Login from './Login';                     
import Registro from './registro';               

// 1. Componente de Lógica de Rutas (Ahora es interno para la limpieza)
function MainAppContent() {
    const { isAuthenticated } = useAuthContext();
    const navigate = useNavigate();

    const handleNavigate = (page) => {
        if (page === 'inventory') {
            navigate('/catalogo');
        } else if (page === 'cart') {
            navigate('/carrito');
        } else if (page === 'ticket') {
            navigate('/ticket');
        }
    };
    
    // Si NO está autenticado, solo mostramos rutas públicas
    if (!isAuthenticated) {
        return (
            <>
                {/* Opcionalmente, puedes renderizar un Header simple para Login */}
                <Header onNavigate={handleNavigate} isPublic={true} /> 
                <Routes>
                    <Route path="/" element={<Login />} /> 
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    {/* Captura todas las demás rutas y redirige a login */}
                    <Route path="*" element={<Login />} /> 
                </Routes>
            </>
        );
    }

    // Si SÍ está autenticado, mostramos rutas privadas envueltas en CartProvider
    return (
        <CartProvider>
            <Header onNavigate={handleNavigate} />
            <Routes>
                {/* Ruta de redireccionamiento por defecto */}
                <Route path="/" element={<InventoryPage />} /> 

                {/* Rutas principales del flujo de compra */}
                <Route path="/catalogo" element={<InventoryPage />} />
                <Route path="/carrito" element={<CartPage onNavigate={handleNavigate} />} />
                <Route path="/ticket" element={<TicketPage onBackToInventory={() => handleNavigate('inventory')} />} />
                
                {/* Fallback para cualquier otra ruta (Redirigir a Catálogo) */}
                <Route path="*" element={<InventoryPage />} />
            </Routes>
        </CartProvider>
    );
}

// 2. Componente Principal (Solo sirve como contenedor)
function App() {
    // Aquí es donde usaremos MainAppContent, que está dentro del AuthProvider
    // definido en index.js y tiene acceso a useAuthContext
    return <MainAppContent />;
}

export default App;
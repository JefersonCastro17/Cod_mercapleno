import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/ui/Header';
import InventoryPage from './pages/InventoryPage';
import CartPage from './pages/CartPage';
import TicketPage from './pages/TicketPage';

function App() {
  const [currentPage, setCurrentPage] = useState('inventory');

  const renderPage = () => {
    switch (currentPage) {
      case 'cart':
        return <CartPage onNavigate={setCurrentPage} />; 
      case 'ticket':
        return <TicketPage onBackToInventory={() => setCurrentPage('inventory')} />;
      default:
        return <InventoryPage />;
    }
  };

  return (
    <CartProvider>
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
    </CartProvider>
  );
}

export default App;
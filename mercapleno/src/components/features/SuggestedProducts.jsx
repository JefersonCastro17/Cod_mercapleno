import React from 'react';
import { useCartContext } from '../../context/CartContext';
import { getProducts } from '../../services/productData';
import ProductCard from '../ui/ProductCard';

const allProducts = getProducts();

function SuggestedProducts() {
  const { cart } = useCartContext();

  const cartIds = cart.map(item => item.id);
  const suggested = allProducts
    .filter(product => !cartIds.includes(product.id))
    .slice(0, 4);

  if (suggested.length === 0) {
    return null;
  }

  return (
    <section id="productos-sugeridos-container" className="productos-sugeridos-container">
      <h2>Productos sugeridos para ti</h2>
      <div className="catalogo-sugeridos"> 
        {suggested.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default SuggestedProducts;
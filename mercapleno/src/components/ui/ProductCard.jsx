import React from 'react';
import { useCartContext } from '../../context/CartContext';
import { formatPrice } from '../../services/productData';

function ProductCard({ product }) {
  const { addToCart } = useCartContext();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="producto" data-name={product.nombre} data-category={product.category} data-price={product.price} data-id={product.id}>
      <p className="nombre">{product.nombre}</p>
      <div className="imagen">
        <img src={`./images/${product.image}`} alt={product.nombre} />
      </div>
      <p className="precio">{formatPrice(product.price)}</p>
      <div className="botones">
        <button 
          className="botoncito_producto"
          onClick={handleAddToCart}
        >
          <span>agregar al carrito</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
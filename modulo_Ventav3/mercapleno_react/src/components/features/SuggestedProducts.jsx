import React, { useState, useEffect } from 'react'; // Importar hooks
import { useCartContext } from '../../context/CartContext';
import { getProducts } from '../../services/productData'; // La función async
import ProductCard from '../ui/ProductCard';

function SuggestedProducts() {
  const { cart } = useCartContext();
  const [allProducts, setAllProducts] = useState([]); // Estado para los productos
  const [isLoading, setIsLoading] = useState(true);

  // Carga asíncrona de productos
  useEffect(() => {
    const fetchProducts = async () => {
        const data = await getProducts();
        setAllProducts(data);
        setIsLoading(false);
    };
    fetchProducts();
  }, []); // Se ejecuta solo al montar

  // La lógica de sugeridos debe ejecutarse DESPUÉS de cargar
  const cartIds = cart.map(item => item.id);
  const suggested = allProducts
    .filter(product => !cartIds.includes(product.id))
    .slice(0, 4);

  // Muestra cargando mientras llegan los datos
  if (isLoading) {
    return <p style={{textAlign: 'center', margin: '20px 0'}}>Cargando sugerencias...</p>;
  }

  // Si no hay productos (después de cargar) o no hay sugeridos
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
// 🟢 src/components/features/SuggestedProducts.jsx (VERSIÓN CORREGIDA Y ROBUSTA)

import React, { useState, useEffect } from 'react'; 
import { useCartContext } from '../../context/CartContext';
import { getProducts } from '../../services/productData'; 
import ProductCard from '../ui/ProductCard';

function SuggestedProducts() {
    const { cart } = useCartContext();
    const [allProducts, setAllProducts] = useState([]); // Inicia como array vacío
    const [isLoading, setIsLoading] = useState(true);

    // Carga asíncrona de productos
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                
                // 💡 CORRECCIÓN 1: Asegura que data sea un array, o usa un array vacío
                const productsArray = Array.isArray(data) 
                    ? data 
                    : (data?.data || data?.products || []); // Usa encadenamiento opcional para evitar error si 'data' es undefined
                    
                setAllProducts(productsArray);
            } catch (error) {
                // Si falla, al menos establece el estado a un array vacío
                console.error("Error al cargar todos los productos para sugerencias:", error);
                setAllProducts([]); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []); 

    // 💡 CORRECCIÓN 2: Lógica de sugeridos DEFENSIVA
    // Aseguramos que allProducts sea un array vacío si por alguna razón no lo es.
    const productsToFilter = Array.isArray(allProducts) ? allProducts : [];
    
    // Obtener IDs de productos en el carrito
    const cartIds = cart.map(item => item.id);
    
    // Aplicar filtros, asegurando que productsToFilter no es undefined
    const suggested = productsToFilter
        .filter(product => !cartIds.includes(product.id))
        .sort(() => 0.5 - Math.random()) 
        .slice(0, 4);

    // Muestra cargando mientras llegan los datos
    if (isLoading) {
        return <p style={{textAlign: 'center', margin: '20px 0'}}>Cargando sugerencias...</p>;
    }

    // Si no hay sugeridos disponibles
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
// src/pages/InventoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ui/ProductCard';
import FilterBar from '../components/features/FilterBar'; 
import { getProducts, getCategories } from '../services/productData'; 

function InventoryPage() {
    const [products, setProducts] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [categories, setCategories] = useState([]);
    
    // Estado único para gestionar TODOS los filtros
    const [currentFilters, setCurrentFilters] = useState({
        nombre: '',
        categoria: 'todas',
        precioMin: '',
        precioMax: '',
    });


    // 1. CARGA ASÍNCRONA DE CATEGORÍAS (Una sola vez)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                // Incluimos la opción "todas" al inicio
                setCategories([{ value: 'todas', label: 'Todas las categorías' }, ...data]);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            }
        };
        fetchCategories();
    }, []);

    
    // 2. FUNCIÓN DE CARGA ASÍNCRONA DE PRODUCTOS CON TODOS LOS FILTROS
    const fetchFilteredProducts = useCallback(async (filters) => {
        setIsLoading(true);
        try {
            // Pasamos todos los filtros a la función de servicio
            const data = await getProducts(
                filters.nombre, 
                filters.categoria,
                filters.precioMin,
                filters.precioMax
            ); 
            setProducts(data);
        } catch (error) {
            console.error("Error al cargar productos filtrados:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 3. EFECTO: Se dispara la carga de productos CADA VEZ que los filtros cambian
    useEffect(() => {
        fetchFilteredProducts(currentFilters);
    }, [currentFilters, fetchFilteredProducts]);


    // 4. HANDLER: Función para recibir los filtros actualizados de FilterBar
    const handleFilterChange = useCallback((newFilters) => {
        // Actualizamos el estado de filtros. El useEffect anterior hace la llamada a la API.
        setCurrentFilters(newFilters);
    }, []);


    // RENDERIZADO
    return (
        <div>
            <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Catálogo de Productos</h1>

            {/* BARRA DE FILTROS: Sustituimos el código de filtros por el componente FilterBar */}
            <FilterBar 
                onFilterChange={handleFilterChange} 
                categories={categories} // Le pasamos las categorías cargadas del backend
            />

            {isLoading ? (
                <p style={{ textAlign: 'center' }}>Cargando productos...</p>
            ) : (
                <>
                    {/* CATÁLOGO DE PRODUCTOS (Ya están filtrados por el backend) */}
                    <section className="catalogo">
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
                                No se encontraron productos que coincidan con los filtros.
                            </p>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default InventoryPage;
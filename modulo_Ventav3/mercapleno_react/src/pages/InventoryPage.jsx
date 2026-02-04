// src/pages/InventoryPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { getProducts } from '../services/productData'; // Importa la función ASÍNCRONA

function InventoryPage() {
  const [products, setProducts] = useState([]); // Almacena todos los productos del API
  const [isLoading, setIsLoading] = useState(true); // Control de carga
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  
  // 1. CARGA ASÍNCRONA DE PRODUCTOS
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const data = await getProducts();
      // Asegúrate de normalizar las categorías a minúsculas para un filtrado consistente
      const normalizedData = data.map(p => ({
        ...p,
        category: p.category ? p.category.toLowerCase() : 'otros'
      }));
      setProducts(normalizedData); 
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  // 2. CÁLCULO DE CATEGORÍAS DISPONIBLES (usa el estado 'products')
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['todas', ...Array.from(cats)].map(c => ({
      value: c,
      label: c.charAt(0).toUpperCase() + c.slice(1)
    }));
  }, [products]);


  // 3. FILTRADO DE PRODUCTOS (usa el estado 'products')
  const filteredProducts = useMemo(() => {
    if (isLoading) return [];

    return products.filter(product => {
      // Usamos 'nombre' del backend, y aseguramos minúsculas para la búsqueda
      const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'todas' || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter, products, isLoading]);


  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('todas');
  };

  // RENDERIZADO
  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Catálogo de Productos</h1>

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Cargando productos...</p>
      ) : (
        <>
          {/* BARRA DE FILTROS */}
          <section className="filtros">
            <input 
              id="buscarNombre" 
              type="text" 
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select 
              id="filtroCategoria" 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            
            <button className="boton-nav" onClick={handleClearFilters}>
              Limpiar Filtros
            </button>
          </section>

          {/* CATÁLOGO DE PRODUCTOS */}
          <section className="catalogo">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
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

export default InventoryPage; // <--- CORRECCIÓN DE EXPORTACIÓN
import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { getProducts } from '../services/productData';

const allProducts = getProducts();

function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  
  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category));
    return ['todas', ...Array.from(cats)].map(c => ({
      value: c,
      label: c.charAt(0).toUpperCase() + c.slice(1)
    }));
  }, []);


  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'todas' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter]);


  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('todas');
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Catálogo de Productos</h1>

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

      <section className="catalogo">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p style={{gridColumn: '1 / -1', textAlign: 'center'}}>No se encontraron productos que coincidan con los filtros.</p>
        )}
      </section>
    </div>
  );
}

export default InventoryPage;
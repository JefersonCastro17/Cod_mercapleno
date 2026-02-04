
import React, { useState, useEffect } from 'react';

function FilterBar({ products, onFilterChange }) {

  const [filters, setFilters] = useState({
    nombre: '',
    categoria: 'todas',
    precioMin: '',
    precioMax: '',
  });


  const categories = [...new Set(products.map(p => p.category))];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleClear = () => {
    const defaultFilters = { nombre: '', categoria: 'todas', precioMin: '', precioMax: '' };
    setFilters(defaultFilters);
  };

 
  useEffect(() => {
    const applyFilter = () => {
      const { nombre, categoria, precioMin, precioMax } = filters;
      const min = Number(precioMin) || 0;
      const max = Number(precioMax) || Infinity;
      const nombreLower = nombre.toLowerCase();

      const filtered = products.filter(p => {
        const pName = p.name.toLowerCase();
        const pCategory = p.category;
        const pPrice = p.price;

        const coincideNombre = pName.includes(nombreLower);
        const coincideCat = categoria === 'todas' || pCategory === categoria;
        const coincidePrecio = pPrice >= min && pPrice <= max;

        return coincideNombre && coincideCat && coincidePrecio;
      });

      onFilterChange(filtered);
    };

    applyFilter();
  }, [filters, products, onFilterChange]);

  return (
    <section className="filtros">
      <input 
        id="nombre" 
        type="text" 
        placeholder="Buscar por nombre..." 
        value={filters.nombre}
        onChange={handleInputChange}
      />
      
      <select id="categoria" value={filters.categoria} onChange={handleInputChange}>
        <option value="todas">Todas las categorías</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
        ))}
      </select>

      <input 
        id="precioMin" 
        type="number" 
        placeholder="Precio Mínimo" 
        value={filters.precioMin}
        onChange={handleInputChange}
      />
      <input 
        id="precioMax" 
        type="number" 
        placeholder="Precio Máximo" 
        value={filters.precioMax}
        onChange={handleInputChange}
      />

      <button id="limpiar" className="boton-nav" onClick={handleClear}>
        Limpiar Filtros
      </button>
    </section>
  );
}

export default FilterBar;
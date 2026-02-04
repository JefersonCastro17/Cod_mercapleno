// src/components/ui/FilterBar.jsx (MODIFICADO)
import React, { useState, useEffect } from 'react';

// Ahora FilterBar recibe las categorías disponibles del padre
function FilterBar({ onFilterChange, categories }) { 

  // El estado mantiene todos los filtros
  const [filters, setFilters] = useState({
    nombre: '',
    categoria: 'todas',
    precioMin: '',
    precioMax: '',
  });


  // ¡ELIMINAMOS! La generación local de categorías y la prop 'products'

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleClear = () => {
    const defaultFilters = { nombre: '', categoria: 'todas', precioMin: '', precioMax: '' };
    setFilters(defaultFilters);
    // Al limpiar, disparamos el cambio inmediatamente para recargar los productos
    onFilterChange(defaultFilters); 
  };

 
  // MODIFICACIÓN CLAVE: Este useEffect SÓLO llama a onFilterChange,
  // pasándole los filtros para que el componente padre (InventoryPage) 
  // pueda llamar al backend con estos nuevos parámetros.
  useEffect(() => {
    // Retrasamos la llamada (debounce) si solo cambia el nombre para no saturar el backend
    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, filters.nombre ? 300 : 0); // 300ms de debounce solo si se escribe nombre

    return () => clearTimeout(timeoutId);

  }, [filters, onFilterChange]); // Dependencias: Si los filtros cambian, se notifica al padre

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
        {/* USAMOS LA PROP 'categories' PROVENIENTE DEL BACKEND */}
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Inputs de Precio se mantienen igual */}
      <input id="precioMin" type="number" placeholder="Precio Mínimo" value={filters.precioMin} onChange={handleInputChange} />
      <input id="precioMax" type="number" placeholder="Precio Máximo" value={filters.precioMax} onChange={handleInputChange} />

      <button id="limpiar" className="boton-nav" onClick={handleClear}>
        Limpiar Filtros
      </button>
    </section>
  );
}

export default FilterBar;
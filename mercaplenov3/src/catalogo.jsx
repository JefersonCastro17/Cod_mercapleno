import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import logo from './logo.svg';
import './login.css';
import './catalogo.css';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [ordenamiento, setOrdenamiento] = useState('nombre');

  useEffect(() => {
    verificarUsuario();
    cargarProductos();
    cargarCarritoGuardado();
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }, [carrito]);

  const verificarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUsuario(perfil || { email: user.email });
    } else {
      window.location.href = '/login';
    }
  };

  const cargarProductos = async () => {
    setCargando(true);
    
    // Intentar cargar productos desde Supabase
    const { data, error } = await supabase
      .from('productos')
      .select('*');

    if (data && data.length > 0) {
      setProductos(data);
    } else {
      // Productos por defecto si no hay en la base de datos
      setProductos([
        { id: 1, nombre: 'Manzanas', precio: 2500, imagen: '🍎', categoria: 'Frutas', stock: 50 },
        { id: 2, nombre: 'Bananos', precio: 1800, imagen: '🍌', categoria: 'Frutas', stock: 40 },
        { id: 3, nombre: 'Zanahorias', precio: 1500, imagen: '🥕', categoria: 'Verduras', stock: 60 },
        { id: 4, nombre: 'Tomates', precio: 3000, imagen: '🍅', categoria: 'Verduras', stock: 35 },
        { id: 5, nombre: 'Leche', precio: 4500, imagen: '🥛', categoria: 'Lácteos', stock: 25 },
        { id: 6, nombre: 'Pan', precio: 3500, imagen: '🍞', categoria: 'Panadería', stock: 30 },
        { id: 7, nombre: 'Huevos', precio: 8000, imagen: '🥚', categoria: 'Básicos', stock: 20 },
        { id: 8, nombre: 'Arroz', precio: 5000, imagen: '🍚', categoria: 'Básicos', stock: 45 },
        { id: 9, nombre: 'Naranjas', precio: 2200, imagen: '🍊', categoria: 'Frutas', stock: 55 },
        { id: 10, nombre: 'Lechugas', precio: 1800, imagen: '🥬', categoria: 'Verduras', stock: 40 },
        { id: 11, nombre: 'Queso', precio: 6500, imagen: '🧀', categoria: 'Lácteos', stock: 15 },
        { id: 12, nombre: 'Pollo', precio: 12000, imagen: '🍗', categoria: 'Carnes', stock: 18 },
      ]);
    }
    
    setCargando(false);
  };

  const cargarCarritoGuardado = () => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  };

  const cerrarSesion = async () => {
    const confirmar = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    
    if (confirmar) {
      localStorage.removeItem('carrito');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
      if (existe.cantidad >= producto.stock) {
        alert(`Solo hay ${producto.stock} unidades disponibles`);
        return;
      }
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    const producto = productos.find(p => p.id === id);
    
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
    } else if (nuevaCantidad > producto.stock) {
      alert(`Solo hay ${producto.stock} unidades disponibles`);
    } else {
      setCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      ));
    }
  };

  const vaciarCarrito = () => {
    if (window.confirm('¿Deseas vaciar todo el carrito?')) {
      setCarrito([]);
      localStorage.removeItem('carrito');
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calcularDescuento = () => {
    const total = calcularTotal();
    if (total >= 50000) return total * 0.15; // 15% descuento
    if (total >= 30000) return total * 0.10; // 10% descuento
    if (total >= 20000) return total * 0.05; // 5% descuento
    return 0;
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const total = calcularTotal();

    // Guardar pedido en Supabase
    try {
      const { error } = await supabase
        .from('pedidos')
        .insert([{
          usuario_id: usuario.id,
          productos: carrito,
          total: total,
          descuento: 0,
          fecha: new Date().toISOString()
        }]);

      if (!error) {
        alert(`¡Compra finalizada con éxito!\n\nTotal: ${total.toLocaleString('es-CO')}\n\n¡Gracias por tu compra!`);
        setCarrito([]);
        localStorage.removeItem('carrito');
        setMostrarCarrito(false);
      }
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      alert('Hubo un error al procesar tu compra. Por favor intenta nuevamente.');
    }
  };

  // Filtrar y ordenar productos
  const categorias = ['Todos', ...new Set(productos.map(p => p.categoria))];
  
  let productosFiltrados = productos;

  // Aplicar búsqueda
  if (busqueda) {
    productosFiltrados = productosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Aplicar filtro de categoría
  if (filtroCategoria !== 'Todos') {
    productosFiltrados = productosFiltrados.filter(p => p.categoria === filtroCategoria);
  }

  // Aplicar ordenamiento
  productosFiltrados = [...productosFiltrados].sort((a, b) => {
    if (ordenamiento === 'nombre') return a.nombre.localeCompare(b.nombre);
    if (ordenamiento === 'precio-asc') return a.precio - b.precio;
    if (ordenamiento === 'precio-desc') return b.precio - a.precio;
    return 0;
  });

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="catalogo-wrapper">
      {/* Header */}
      <header>
        <div className="header-container">
          <div className="logo-section">
            <img src={logo} alt="Logo de Mercapleno" className="logo-img" />
            <h1 className="portal-title">Portal 2</h1>
          </div>

          <nav className="nav-links">
            <a href="/" className="nav-btn">Inicio</a>
            <span className="nav-btn usuario-info">
              👤 {usuario?.nombre || 'Usuario'}
            </span>
            <button
              onClick={() => setMostrarCarrito(!mostrarCarrito)}
              className="nav-btn carrito-btn"
            >
              🛒 Carrito 
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </button>
            <button onClick={cerrarSesion} className="nav-btn cerrar-btn">
              🚪 Cerrar Sesión
            </button>
          </nav>
        </div>
      </header>

      {/* Barra de búsqueda debajo del header */}
      <div className="barra-busqueda">
        <div className="busqueda-container">
          <input
            type="text"
            placeholder="🔍 Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input"
          />
          <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value)}
            className="ordenar-select"
          >
            <option value="nombre">Ordenar por: Nombre</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      <main className="catalogo-main">
                  {/* Categorías y descuentos */}
        <div className="categorias-y-descuentos">
          <div className="categorias-box">
            <h3>Categorías</h3>
            <div className="categorias-grid">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={`categoria-btn ${filtroCategoria === cat ? 'activo' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catálogo de productos */}
        {productosFiltrados.length === 0 ? (
          <div className="no-productos">
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="productos-grid">
            {productosFiltrados.map(producto => (
              <div key={producto.id} className="producto-card">
                <div className="producto-emoji">{producto.imagen}</div>
                <h3 className="producto-nombre">{producto.nombre}</h3>
                <p className="producto-categoria">{producto.categoria}</p>
                <p className="producto-stock">Stock: {producto.stock} unidades</p>
                <p className="producto-precio">${producto.precio.toLocaleString('es-CO')}</p>
                <button
                  onClick={() => agregarAlCarrito(producto)}
                  className="agregar-btn"
                  disabled={producto.stock === 0}
                >
                  {producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal del Carrito */}
      {mostrarCarrito && (
        <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛒 Tu Carrito</h2>
              <button
                onClick={() => setMostrarCarrito(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <p>El carrito está vacío</p>
                <p className="carrito-vacio-emoji">🛒</p>
              </div>
            ) : (
              <>
                <div className="carrito-items">
                  {carrito.map(item => (
                    <div key={item.id} className="carrito-item">
                      <div className="item-emoji">{item.imagen}</div>
                      <div className="item-info">
                        <h4>{item.nombre}</h4>
                        <p className="item-precio">${item.precio.toLocaleString('es-CO')}</p>
                      </div>
                      <div className="item-cantidad">
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          className="cantidad-btn"
                        >
                          -
                        </button>
                        <span className="cantidad-numero">{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          className="cantidad-btn"
                        >
                          +
                        </button>
                      </div>
                      <div className="item-subtotal">
                        ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="item-eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="carrito-footer">
                  <div className="carrito-totales">
                    <div className="total-linea total-final">
                      <span>Total:</span>
                      <span>${calcularTotal().toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                  
                  <div className="carrito-acciones">
                    <button onClick={vaciarCarrito} className="btn-vaciar">
                      Vaciar Carrito
                    </button>
                    <button onClick={finalizarCompra} className="btn-comprar">
                      Finalizar Compra
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  useEffect(() => {
    verificarUsuario();
    cargarProductos();
    cargarCarritoGuardado();
  }, []);

  // Guardar carrito
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }, [carrito]);

  // 🔥 CORRECCIÓN IMPORTANTE → verifica sesión con localStorage
  const verificarUsuario = () => {
    const user = localStorage.getItem("user");

    if (!user) {
      navigate("/login");
      return;
    }

    setUsuario(JSON.parse(user));
  };

  // 🔥 Cargar productos
  const cargarProductos = async () => {
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/api/productos');
      const data = await response.json();

      if (data.success && data.productos.length > 0) {
        setProductos(data.productos);
      } else {
        setProductos([
          { id: 1, nombre: 'Manzanas', precio: 2500, imagen: '🍎', categoria: 'Frutas', stock: 50 },
          { id: 2, nombre: 'Bananos', precio: 1800, imagen: '🍌', categoria: 'Frutas', stock: 40 },
        ]);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }

    setCargando(false);
  };

  const cargarCarritoGuardado = () => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  };

  // 🔥 Cerrar sesión corregido
  const cerrarSesion = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("carrito");
    navigate("/login");
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

  // Filtro y búsqueda
  const categorias = ['Todos', ...new Set(productos.map(p => p.categoria))];
  let productosFiltrados = productos;

  if (busqueda) {
    productosFiltrados = productosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  if (filtroCategoria !== 'Todos') {
    productosFiltrados = productosFiltrados.filter(p => p.categoria === filtroCategoria);
  }

  productosFiltrados = [...productosFiltrados].sort((a, b) => {
    if (ordenamiento === 'nombre') return a.nombre.localeCompare(b.nombre);
    if (ordenamiento === 'precio-asc') return a.precio - b.precio;
    if (ordenamiento === 'precio-desc') return b.precio - a.precio;
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
            <img src={logo} alt="Logo" className="logo-img" />
            <h1 className="portal-title">Portal 2</h1>
          </div>

          <nav className="nav-links">
            <a href="/" className="nav-btn">Inicio</a>
            <span className="nav-btn usuario-info">👤 {usuario?.nombre}</span>

            <button onClick={() => setMostrarCarrito(!mostrarCarrito)} className="nav-btn carrito-btn">
              🛒 Carrito 
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </button>

            <button onClick={cerrarSesion} className="nav-btn cerrar-btn">🚪 Cerrar Sesión</button>
          </nav>
        </div>
      </header>

      {/* Barra de búsqueda */}
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

      {/* MAIN */}
      <main className="catalogo-main">

        {/* Categorías */}
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

        {/* Productos */}
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

      {/* Carrito Modal */}
      {mostrarCarrito && (
        <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛒 Tu Carrito</h2>
              <button onClick={() => setMostrarCarrito(false)} className="modal-close">×</button>
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
                    <button onClick={vaciarCarrito} className="btn-vaciar">Vaciar Carrito</button>
                    <button onClick={() => alert("Compra Finalizada")} className="btn-comprar">Finalizar Compra</button>
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./catalogo.css";

export default function Catalogo() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [orden, setOrden] = useState("nombre");

  // 🔐 Verificar sesión
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/login");
  }, [navigate]);

  // 📡 Cargar productos desde la BD
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch("hhttp://localhost:3000/stock");
        const data = await res.json();

        if (!data.success) throw new Error("Error en API");

        setProductos(data.productos);
      } catch (err) {
        setError("No se pudo conectar con el servidor");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  // 🧠 Filtros
  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];

  let productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (categoria !== "Todos") {
    productosFiltrados = productosFiltrados.filter(
      p => p.categoria === categoria
    );
  }

  productosFiltrados.sort((a, b) => {
    if (orden === "nombre") return a.nombre.localeCompare(b.nombre);
    if (orden === "precio-asc") return a.precio - b.precio;
    if (orden === "precio-desc") return b.precio - a.precio;
    return 0;
  });

  // 💬 Pago por WhatsApp (estructura)
  const pagarWhatsapp = () => {
    const telefono = "573001234567"; // CAMBIA ESTE NÚMERO
    const mensaje = "Hola, quiero información sobre los productos del catálogo";
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`);
  };

  if (cargando) return <p className="estado">Cargando catálogo...</p>;
  if (error) return <p className="estado error">{error}</p>;

  return (
    <div className="catalogo-container">

      <header className="catalogo-header">
        <h1>🛍️ Catálogo de Productos</h1>

        <div className="acciones-header">
          <button className="btn-carrito">🛒 Carrito</button>
          <button className="btn-pagar" onClick={pagarWhatsapp}>
            💬 Pagar por WhatsApp
          </button>
        </div>
      </header>

      {/* 🔍 Filtros */}
      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        <select value={categoria} onChange={e => setCategoria(e.target.value)}>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={orden} onChange={e => setOrden(e.target.value)}>
          <option value="nombre">Ordenar por nombre</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
      </div>

      {/* 📦 Productos */}
      <div className="productos-grid">
        {productosFiltrados.length === 0 ? (
          <p>No hay productos disponibles</p>
        ) : (
          productosFiltrados.map(p => (
            <div key={p.id} className="producto-card">
              <img src={p.imagen} alt={p.nombre} />

              <h3>{p.nombre}</h3>
              <p className="categoria">{p.categoria}</p>
              <p className="precio">
                ${Number(p.precio).toLocaleString("es-CO")}
              </p>
              <p className="stock">Stock: {p.stock}</p>

              <button className="btn-agregar" disabled={p.stock <= 0}>
                {p.stock > 0 ? "Agregar al carrito" : "Sin stock"}
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

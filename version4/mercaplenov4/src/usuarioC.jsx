import React, { useState, useEffect, useCallback } from "react";
import "./usuarioC.css";

export default function CRUD1() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    direccion: "",
    fecha_nacimiento: "",
  });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // success o error
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  const token = localStorage.getItem("token");

  // ===========================
  // VERIFICAR AUTENTICACIÓN
  // ===========================
  useEffect(() => {
    if (!token) {
      alert("No autorizado, por favor inicia sesión.");
      window.location.href = "/login";
    } else {
      obtenerUsuarios();
    }
  }, [token]);

  // ===========================
  // AUTO-CERRAR MENSAJES
  // ===========================
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje("");
        setTipoMensaje("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // ===========================
  // OBTENER USUARIOS
  // ===========================
  const obtenerUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/usuarioC/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.usuarios)) {
        setUsuarios(data.usuarios);
      } else {
        setUsuarios([]);
        mostrarMensaje(data.message || "No hay usuarios disponibles", "error");
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      mostrarMensaje("Error cargando usuarios", "error");
    }
    setLoading(false);
  };

  // ===========================
  // MOSTRAR MENSAJE
  // ===========================
  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  };

  // ===========================
  // MANEJAR CAMBIOS EN INPUTS
  // ===========================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===========================
  // CREAR / ACTUALIZAR USUARIO
  // ===========================
  const enviarFormulario = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editId
      ? `http://localhost:3000/usuarioC/${editId}`
      : "http://localhost:3000/usuarioC/";

    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        mostrarMensaje(data.message || "Error en la operación", "error");
        setLoading(false);
        return;
      }

      mostrarMensaje(
        editId ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
        "success"
      );

      resetearFormulario();
      obtenerUsuarios();
    } catch (error) {
      console.error("Error enviando formulario:", error);
      mostrarMensaje("Error en la operación", "error");
    }
    setLoading(false);
  };

  // ===========================
  // RESETEAR FORMULARIO
  // ===========================
  const resetearFormulario = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      direccion: "",
      fecha_nacimiento: "",
    });
    setEditId(null);
  };

  // ===========================
  // PREPARAR EDICIÓN
  // ===========================
  const editar = (u) => {
    setEditId(u.id);
    setFormData({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      password: "",
      direccion: u.direccion,
      fecha_nacimiento: u.fecha_nacimiento
        ? u.fecha_nacimiento.split("T")[0]
        : "",
    });
    setFormularioAbierto(true); // Abrir formulario al editar
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===========================
  // ELIMINAR USUARIO
  // ===========================
  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/usuarioC/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data.success) {
        mostrarMensaje(data.message || "Error eliminando usuario", "error");
        setLoading(false);
        return;
      }

      mostrarMensaje("Usuario eliminado correctamente", "success");
      obtenerUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      mostrarMensaje("Error eliminando usuario", "error");
    }
    setLoading(false);
  };

  // ===========================
  // CERRAR SESIÓN
  // ===========================
  const cerrarSesion = () => {
    if (window.confirm("¿Desea cerrar sesión?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  // ===========================
  // FILTRAR USUARIOS
  // ===========================
  const usuariosFiltrados = usuarios.filter((u) => {
    const searchLower = busqueda.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(searchLower) ||
      u.apellido.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="crud-container">
      {/* NOTIFICACIÓN */}
      {mensaje && (
        <div className={`notificacion ${tipoMensaje}`}>
          <span className="notificacion-icon">
            {tipoMensaje === "success" ? "✅" : "❌"}
          </span>
          <span className="notificacion-texto">{mensaje}</span>
          <button
            className="notificacion-cerrar"
            onClick={() => setMensaje("")}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚙️</span>
            <h2>Panel Admin</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <a href="/usuarioC" className="nav-link active">
                <span className="nav-icon">👥</span>
                <span>Usuarios</span>
              </a>
            </li>
            <li>
              <a href="/productos" className="nav-link">
                <span className="nav-icon">📦</span>
                <span>Productos</span>
              </a>
            </li>
            <li>
              <a href="/reportes" className="nav-link">
                <span className="nav-icon">📊</span>
                <span>Reportes</span>
              </a>
            </li>
            <li>
              <a href="/estadisticas" className="nav-link">
                <span className="nav-icon">📈</span>
                <span>Estadísticas</span>
              </a>
            </li>
          </ul>
        </nav>

        <button className="btn-logout" onClick={cerrarSesion}>
          <span>🚪</span>
          Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido">
        {/* FORMULARIO COLAPSABLE MINIMALISTA */}
        <section className="formulario-section">
          <button 
            className="formulario-toggle"
            onClick={() => setFormularioAbierto(!formularioAbierto)}
            type="button"
          >
            <span className="toggle-icon">{editId ? "✏️" : "➕"}</span>
            <span className="toggle-text">
              {editId ? "Editar Usuario" : "Nuevo Usuario"}
            </span>
            <span className="toggle-arrow">▼</span>
          </button>

          <div className={`formulario-contenido ${formularioAbierto ? 'open' : ''}`}>
            <form className="formulario" onSubmit={enviarFormulario}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Ingrese el nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  placeholder="Ingrese el apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder={editId ? "Dejar vacío para no cambiar" : "Ingrese la contraseña"}
                  value={formData.password}
                  onChange={handleChange}
                  required={!editId}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="direccion">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  placeholder="Ingrese la dirección"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-guardar" disabled={loading}>
                {loading ? "⏳ Guardando..." : editId ? "💾 Actualizar" : "💾 Guardar"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={resetearFormulario}
                >
                  ❌ Cancelar
                </button>
              )}
            </div>
          </form>
          </div>
        </section>

        {/* SECCIÓN DE TABLA */}
        <section className="tabla-section">
          {/* HEADER CON TÍTULO Y TOTAL */}
          <div className="tabla-main-header">
            <div className="titulo-principal">
              <h1>📋 CRUD de Usuarios</h1>
              <p className="subtitulo">Gestión y administración de usuarios del sistema</p>
            </div>
            <div className="total-usuarios-card">
              <span className="total-label">Total Usuarios</span>
              <span className="total-count">{usuarios.length}</span>
            </div>
          </div>

          {/* CONTROLES DE BÚSQUEDA */}
          <div className="tabla-controles-header">
            <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
            <span className="badge-count-filtro">
              {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando usuarios...</p>
            </div>
          ) : (
            <div className="tabla-wrapper">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Dirección</th>
                    <th>Fecha Nac.</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        <span className="empty-icon">📭</span>
                        <p>
                          {busqueda
                            ? "No se encontraron usuarios con ese criterio"
                            : "No hay usuarios registrados"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <span className="badge-id">#{u.id}</span>
                        </td>
                        <td>{u.nombre}</td>
                        <td>{u.apellido}</td>
                        <td>{u.email}</td>
                        <td>{u.direccion}</td>
                        <td>
                          {u.fecha_nacimiento
                            ? new Date(u.fecha_nacimiento).toLocaleDateString("es-ES")
                            : "-"}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-editar"
                              onClick={() => editar(u)}
                              title="Editar usuario"
                              aria-label="Editar usuario"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-eliminar"
                              onClick={() => eliminar(u.id)}
                              title="Eliminar usuario"
                              aria-label="Eliminar usuario"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
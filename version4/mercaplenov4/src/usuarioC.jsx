import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("No autorizado, por favor inicia sesión.");
      window.location.href = "/login";
    } else {
      obtenerUsuarios();
    }
  }, [token]);

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
        setMensaje(data.message || "No hay usuarios disponibles");
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setMensaje("Error cargando usuarios");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===========================
  // CREAR / ACTUALIZAR
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
        setMensaje(data.message || "Error en la operación");
        setLoading(false);
        return;
      }

      setMensaje(editId ? "Usuario actualizado" : "Usuario creado correctamente");

      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        direccion: "",
        fecha_nacimiento: "",
      });
      setEditId(null);

      obtenerUsuarios();
    } catch (error) {
      console.error("Error enviando formulario:", error);
      setMensaje("Error en la operación");
    }
    setLoading(false);
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
      password: "", // no rellenar contraseña
      direccion: u.direccion,
      fecha_nacimiento: u.fecha_nacimiento
        ? u.fecha_nacimiento.split("T")[0]
        : "",
    });
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
        setMensaje(data.message || "Error eliminando usuario");
        setLoading(false);
        return;
      }

      setMensaje("Usuario eliminado correctamente");
      obtenerUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setMensaje("Error eliminando usuario");
    }
    setLoading(false);
  };

  // ===========================
  // CERRAR SESIÓN
  // ===========================
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="crud-container">
      <aside className="sidebar">
        <h2>Panel Admin</h2>
          <ul>
            <li><a href="/usuarioC">Usuarios</a></li>
            <li><a href="/productos">Productos</a></li>
            <li><a href="/reportes">Reportes</a></li>
            <li><a href="/estadisticas">Estadísticas</a></li> {/* NUEVO ENLACE */}
          </ul>

        <button className="btn-logout" onClick={cerrarSesion}>
          Cerrar Sesión
        </button>
      </aside>

      <main className="contenido">
        <h1>CRUD de Usuarios</h1>

        {mensaje && <p className="mensaje">{mensaje}</p>}
        {loading && <p className="mensaje">Cargando...</p>}

        <form className="formulario" onSubmit={enviarFormulario}>
          <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
          <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
          <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />
          <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
          <button type="submit" className="btn-guardar">{editId ? "Actualizar" : "Guardar"}</button>
        </form>

        <table className="tabla">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan="5">No hay usuarios</td></tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.apellido}</td>
                  <td>{u.email}</td>
                  <td>
                    <button className="btn-editar" onClick={() => editar(u)}>Editar</button>
                    <button className="btn-eliminar" onClick={() => eliminar(u.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}

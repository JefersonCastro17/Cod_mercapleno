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

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // ===========================
  // GET USUARIOS
  // ===========================
  const obtenerUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3000/usuarioC/");
      const data = await res.json();

      if (data.success && Array.isArray(data.usuarios)) {
        setUsuarios(data.usuarios);
      } else {
        setUsuarios([]);
      }

    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setMensaje("Error cargando usuarios");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===========================
  // CONTROLAR SUBMIT (Crear / Actualizar)
  // ===========================
  const enviarFormulario = async (e) => {
    e.preventDefault();

    if (editId === null) {
      await crearUsuario();
    } else {
      await actualizarUsuario();
    }

    obtenerUsuarios();
  };

  // ===========================
  // POST CREAR USUARIO
  // ===========================
  const crearUsuario = async () => {
    try {
      const res = await fetch("http://localhost:3000/usuarioC/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
});


      const data = await res.json();

      if (!data.success) {
        setMensaje(data.message || "Error guardando usuario");
        return;
      }

      setMensaje("Usuario creado correctamente");

      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        direccion: "",
        fecha_nacimiento: "",
      });

    } catch (error) {
      console.error("Error crear usuario:", error);
      setMensaje("Error guardando usuario");
    }
  };

  // ===========================
  // PUT ACTUALIZAR USUARIO
  // ===========================
  const actualizarUsuario = async () => {
    try {
    const res = await fetch(`http://localhost:3000/usuarioC/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
});


      const data = await res.json();

      if (!data.success) {
        setMensaje(data.message || "Error actualizando usuario");
        return;
      }

      setMensaje("Usuario actualizado correctamente");

      setEditId(null);

      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        direccion: "",
        fecha_nacimiento: "",
      });

    } catch (error) {
      console.error("Error actualizar usuario:", error);
      setMensaje("Error actualizando usuario");
    }
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
  };

  // ===========================
  // DELETE ELIMINAR USUARIO
  // ===========================
  const eliminar = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/usuarioC/${id}`, {
        method: "DELETE",
      });


      const data = await res.json();

      if (!data.success) {
        setMensaje(data.message || "Error eliminando usuario");
        return;
      }

      setMensaje("Usuario eliminado");
      obtenerUsuarios();

    } catch (error) {
      console.error("Error eliminar usuario:", error);
      setMensaje("Error eliminando usuario");
    }
  };

  // ===========================
  // INTERFAZ
  // ===========================
  return (
    <div className="crud-container">
      <aside className="sidebar">
        <h2>Panel Admin</h2>
        <ul>
          <li>Usuarios</li>
          <li>Productos</li>
          <li>Reportes</li>
        </ul>
      </aside>

      <main className="contenido">
        <h1>CRUD de Usuarios</h1>

        {mensaje && <p className="mensaje">{mensaje}</p>}

        <form className="formulario" onSubmit={enviarFormulario}>
          <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} />
          <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} />
          <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} />
          <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
          <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} />
          <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />

          <button type="submit" className="btn-guardar">
            {editId ? "Actualizar" : "Guardar"}
          </button>
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

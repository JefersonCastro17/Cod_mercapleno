import React, { useEffect, useState, useCallback } from "react";
import "../styles/usuarioC.css"; 
import { useAuthContext } from '../context/AuthContext'; 

export default function UsuarioC() {
  const { token, logout } = useAuthContext(); 
  
  const [usuarios, setUsuarios] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    direccion: "",
    fecha_nacimiento: "",
    id_rol: "3", 
    id_tipo_identificacion: "1",
    numero_identificacion: ""
  });

  /* =======================
     TOAST
  ======================= */
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // 🔑 CORRECCIÓN ESLINT: Se envuelve en useCallback y depende de token y logout
  const getAuthHeaders = useCallback((extraHeaders = {}) => {
      if (!token) {
          console.error("Token no disponible. Se requiere autenticación.");
      }
      return {
          ...extraHeaders,
          'Authorization': `Bearer ${token}` 
      };
  }, [token]); // Solo necesita depender de 'token'

  /* =======================
     CARGAR USUARIOS (USA TOKEN)
  ======================= */
  // 🔑 CORRECCIÓN ESLINT: Se incluye getAuthHeaders como dependencia
  const cargar = useCallback(async () => {
    try {
        const res = await fetch("http://localhost:4000/api/admin/users", {
            headers: getAuthHeaders()
        });

        if (res.status === 401 || res.status === 403) {
            logout(); // Forzar logout si el token es inválido/expirado
            mostrarToast("⚠️ Sesión expirada. Por favor, inicie sesión de nuevo.", "error");
            return;
        }
        
        const data = await res.json();
        setUsuarios(data.usuarios || []);
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
        mostrarToast("❌ Error de conexión con el servidor.", "error");
    }
  }, [getAuthHeaders, logout]); // Depende del memoizado getAuthHeaders y logout

  // 🟢 CORRECCIÓN ESLINT: Se incluye 'cargar' como dependencia
  useEffect(() => {
    cargar();
  }, [cargar]); 

  /* =======================
     GUARDAR (CREATE / UPDATE) (USA TOKEN)
  ======================= */
  const guardar = async () => {
    const url = editId
      ? `http://localhost:4000/api/admin/users/${editId}`
      : "http://localhost:4000/api/admin/users";

    const method = editId ? "PUT" : "POST";

    const payload = { ...form };

    if (editId && !payload.password) {
      delete payload.password;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders({ "Content-Type": "application/json" }), 
        body: JSON.stringify(payload)
      });
      
      if (res.status === 401 || res.status === 403) {
          logout();
          mostrarToast("⚠️ Sesión expirada. Inicie sesión de nuevo.", "error");
          return;
      }

      const data = await res.json();

      if (!data.success) {
        mostrarToast("❌ Error al guardar usuario", "error");
        return;
      }

      mostrarToast(editId ? "✏ Usuario actualizado" : "✅ Usuario creado");
      setMostrar(false);
      setEditId(null);
      limpiar();
      cargar();
    } catch (err) {
      mostrarToast("❌ Error de conexión", "error");
    }
  };

  /* =======================
     LIMPIAR FORM
  ======================= */
  const limpiar = () => {
    setForm({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      direccion: "",
      fecha_nacimiento: "",
      id_rol: "3", // Cliente
      id_tipo_identificacion: "1",
      numero_identificacion: ""
    });
  };

  /* =======================
     EDITAR
  ======================= */
  const editar = (u) => {
    setEditId(u.id);
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      password: "",
      direccion: u.direccion,
      fecha_nacimiento: u.fecha_nacimiento?.split("T")[0] || "",
      id_rol: String(u.id_rol),
      id_tipo_identificacion: String(u.id_tipo_identificacion),
      numero_identificacion: u.numero_identificacion
    });
    setMostrar(true);
  };

  /* =======================
     ELIMINAR (USA TOKEN)
  ======================= */
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    try {
        const res = await fetch(`http://localhost:4000/api/admin/users/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (res.status === 401 || res.status === 403) {
            logout();
            mostrarToast("⚠️ Sesión expirada. Inicie sesión de nuevo.", "error");
            return;
        }

        mostrarToast("🗑 Usuario eliminado");
        cargar();
    } catch (error) {
        mostrarToast("❌ Error al eliminar.", "error");
    }
  };

  /* =======================
     BADGE ROL
  ======================= */
  const rolBadge = (rol) => {
    if (rol === 1) return <span className="badge admin">Admin</span>; 
    if (rol === 2) return <span className="badge empleado">Empleado</span>; 
    return <span className="badge cliente">Cliente</span>;
  };

  /* =======================
     FILTRO
  ======================= */
  const usuariosFiltrados = usuarios.filter(u =>
    `${u.nombre} ${u.apellido} ${u.email}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="container">

      {toast && <div className={`toast ${toast.tipo}`}>{toast.mensaje}</div>}

      <div className="main">
        <div className="controles">
          <button className="btn-crear" onClick={() => setMostrar(true)}>
            ➕ Nuevo Usuario
          </button>

          <input
            className="input-busqueda"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="tabla-container">
          <table className="tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Tipo Doc</th>
                <th>N° Documento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="td-empty">Sin usuarios</td>
                </tr>
              ) : (
                usuariosFiltrados.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre} {u.apellido}</td>
                    <td>{u.email}</td>
                    <td>{rolBadge(u.id_rol)}</td>
                    <td>{u.id_tipo_identificacion}</td>
                    <td>{u.numero_identificacion}</td>
                    <td>
                      <button className="btn-modificar" onClick={() => editar(u)}>
                        Editar
                      </button>
                      <button className="btn-eliminar" onClick={() => eliminar(u.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =======================
           MODAL
      ======================= */}
      {mostrar && (
        <div className="modal-overlay">
          <div className="modal-content">

            <div className="modal-header">
              <h2>{editId ? "Editar Usuario" : "Nuevo Usuario"}</h2>
              <button className="modal-close" onClick={() => setMostrar(false)}>×</button>
            </div>

            <div className="modal-body">

              {["nombre", "apellido", "email", "direccion", "numero_identificacion"].map(campo => (
                <div className="form-group" key={campo}>
                  <label>{campo.replace("_", " ")}</label>
                  <input
                    className="input"
                    value={form[campo]}
                    onChange={e => setForm({ ...form, [campo]: e.target.value })}
                  />
                </div>
              ))}

              <div className="form-group">
                <label>Tipo de Identificación</label>
                <select
                  className="input"
                  value={form.id_tipo_identificacion}
                  onChange={e => setForm({ ...form, id_tipo_identificacion: e.target.value })}
                >
                  <option value="1">Cédula</option>
                  <option value="2">Pasaporte</option>
                  <option value="3">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select
                  className="input"
                  value={form.id_rol}
                  onChange={e => setForm({ ...form, id_rol: e.target.value })}
                >
                  <option value="1">Administrador</option>
                  <option value="2">Empleado</option>
                  <option value="3">Cliente</option>
                </select>
              </div>

              {!editId && (
                <div className="form-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    className="input"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}

            </div>

            <div className="modal-footer">
              <button className="btn-guardar" onClick={guardar}>Guardar</button>
              <button className="btn-cancelar" onClick={() => setMostrar(false)}>Cancelar</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
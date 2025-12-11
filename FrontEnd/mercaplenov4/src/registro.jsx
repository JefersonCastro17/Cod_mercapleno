import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import "./registro.css";
import logo from "./logo.svg";

function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    direccion: "",
    fecha_nacimiento: "",
    id_rol: 3, // 🔥 Rol fijo (cliente)
    id_tipo_identificacion: "",
    numero_identificacion: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {
      nombre,
      apellido,
      email,
      password,
      direccion,
      fecha_nacimiento,
      id_tipo_identificacion,
      numero_identificacion
    } = formData;

    // Validación
    if (!nombre || !apellido || !email || !password || !direccion ||
        !fecha_nacimiento || !id_tipo_identificacion || !numero_identificacion) {
      setMessage("Por favor completa todos los campos");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // Validar edad mínima
    const nacimiento = new Date(fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();

    if (edad < 10) {
      setMessage("Debes tener al menos 10 años para registrarte");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Error al registrar");
        setMessageType("error");
        setLoading(false);
        return;
      }

      setMessage("¡Registro exitoso!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error("ERROR FETCH:", err);
      setMessage("Error al conectar con el servidor");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <div className="header-container">
          <div className="logo-section">
            <img src={logo} alt="Logo" className="logo-img" />
            <h1 className="portal-title">Portal 2</h1>
          </div>

          <nav className="nav-links">
            <a href="/" className="nav-btn">Inicio</a>
            <a href="/login" className="nav-btn">Iniciar Sesión</a>
            <a href="/registro" className="nav-btn">Regístrate</a>
          </nav>
        </div>
      </header>

      <main>
        <div className="form-container">
          <h2>Registrarse</h2>

          {message && <div className={`message ${messageType}`}>{message}</div>}

          <form onSubmit={handleSubmit}>

            {/* Línea 1 */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Tipo documento */}
            <div className="form-group">
              <label htmlFor="id_tipo_identificacion">Tipo de identificación</label>
              <select
                id="id_tipo_identificacion"
                value={formData.id_tipo_identificacion}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="1">Cédula de ciudadanía</option>
                <option value="2">Tarjeta de identidad</option>
                <option value="3">Cédula de extranjería</option>
              </select>
            </div>

            {/* Número documento */}
            <div className="form-group">
              <label htmlFor="numero_identificacion">Número de identificación</label>
              <input
                type="text"
                id="numero_identificacion"
                value={formData.numero_identificacion}
                onChange={handleChange}
              />
            </div>

            {/* Fecha */}
            <div className="form-group">
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
              <input
                type="date"
                id="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Dirección */}
            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* 🔥 Campo oculto: id_rol */}
            <input type="hidden" id="id_rol" value={3} />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Registrando..." : "Enviar"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default Registro;

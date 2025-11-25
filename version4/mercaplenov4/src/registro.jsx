import { useState } from "react";
import "./login.css";
import "./registro.css";
import logo from "./logo.svg";

function Registro() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    direccion: "",
    dia: "",
    mes: "",
    ano: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const dias = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const anos = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { nombre, apellido, email, password, direccion, dia, mes, ano } = formData;

    if (!nombre || !apellido || !email || !password || !direccion || !dia || !mes || !ano) {
      setMessage("Por favor completa todos los campos");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const fecha_nacimiento = `${ano}-${mes}-${dia}`;

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          password,
          direccion,
          fecha_nacimiento,
        }),
      });

      // ✔ leer directamente como JSON
      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Error al registrar");
        setMessageType("error");
        setLoading(false);
        return;
      }

      setMessage("¡Registro exitoso!");
      setMessageType("success");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

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
            <img src={logo} alt="Logo de Mercapleno" className="logo-img" />
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

          {message && (
            <div className={`message ${messageType}`}>{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Nombres"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  placeholder="Apellidos"
                  value={formData.apellido}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <div className="date-row">
                <select id="dia" value={formData.dia} onChange={handleChange} disabled={loading}>
                  <option value="">Día</option>
                  {dias.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>

                <select id="mes" value={formData.mes} onChange={handleChange} disabled={loading}>
                  <option value="">Mes</option>
                  {meses.map((m, i) => (
                    <option key={i} value={(i + 1).toString().padStart(2, "0")}>{m}</option>
                  ))}
                </select>

                <select id="ano" value={formData.ano} onChange={handleChange} disabled={loading}>
                  <option value="">Año</option>
                  {anos.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                placeholder="Ingresa tu dirección"
                value={formData.direccion}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Introduce una contraseña"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Registrando..." : "Enviar"}
            </button>

            <div className="register-link">
              <p>¿Tienes una cuenta? <a href="/login">Iniciar Sesión</a></p>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default Registro;

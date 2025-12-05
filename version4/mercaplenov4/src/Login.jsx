import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import logo from "./logo.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [requireCode, setRequireCode] = useState(false);
  const [expectedCode, setExpectedCode] = useState(""); // Código que debe ingresar
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      // ========================================
      // PRIMERA PARTE: VERIFICAR ROL Y PEDIR CÓDIGO
      // ========================================

if (data.success && !requireCode) {
  if (data.user.id_rol === 1) { // ADMIN
    setRequireCode(true);
    setExpectedCode("123");
    alert("Este usuario es ADMIN. Ingrese el código de seguridad.");
    setLoading(false);
    return;
  }

  if (data.user.id_rol === 2) { // EMPLEADO
    setRequireCode(true);
    setExpectedCode("456");
    alert("Este usuario es EMPLEADO. Ingrese el código de seguridad.");
    setLoading(false);
    return;
  }

  if (data.user.id_rol === 3) { // CLIENTE
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/catalogo");
    return;
  }
}


      // ========================================
      // SEGUNDA PARTE: VALIDAR CÓDIGO
      // ========================================

if (requireCode) {
  if (securityCode !== expectedCode) {
    alert("Código de seguridad incorrecto.");
    setLoading(false);
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  alert("Inicio de sesión exitoso");

  if (data.user.id_rol === 1) {
    navigate("/usuarioC");
  } else if (data.user.id_rol === 2) {
    navigate("/usuarioC");
  } else {
    navigate("/catalogo");
  }
  return;
}


      // Error normal
      if (!data.success) {
        alert(data.message || "Credenciales incorrectas");
      }

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error de conexión.");
    }

    setLoading(false);
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
            <Link to="/" className="nav-btn">Inicio</Link>
            <Link to="/registro" className="nav-btn">Regístrate</Link>
          </nav>
        </div>
      </header>

      <main>
        <div className="form-container">
          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={requireCode}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={requireCode}
              />
            </div>

            {/* CÓDIGO DE SEGURIDAD */}
            {requireCode && (
              <div className="form-group">
                <label htmlFor="securityCode">Código de seguridad</label>
                <input
                  type="text"
                  id="securityCode"
                  placeholder="Ingrese el código de seguridad"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="register-link">
              <p>
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
              </p>
            </div>

          </form>
        </div>
      </main>
    </>
  );
}

export default Login;

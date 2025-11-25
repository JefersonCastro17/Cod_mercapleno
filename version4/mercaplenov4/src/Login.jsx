import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import logo from "./logo.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      if (!response.ok || !data.success) {
        alert(data.message || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      // Guardar token
      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      alert("Inicio de sesión exitoso");

      // Redirigir con React Router
      navigate("/catalogo");

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error de conexión. Intenta de nuevo.");
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Introduce tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

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

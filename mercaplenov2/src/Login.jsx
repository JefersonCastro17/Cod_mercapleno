import { useState } from "react"; //añadir estado a un componente, añadir y manipulardatos localmente
import "./login.css";
import logo from "./logo.svg"; 


//funcion de iniciar sesion
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => { //flecha
    e.preventDefault(); //yo me encargo

    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    //token
    if (data.success) {
      localStorage.setItem("token", data.token);
      alert("Inicio de sesión exitoso ");
      window.location.href = "https://www.youtube.com/"; //CAMBIAR LA REEDIRECCION DeSPUES DE LA MIGRACION
    } else {
      alert(data.message || "Error al iniciar sesión ");
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
            <a href="/" className="nav-btn">
              Inicio
            </a>
            <a href="/registro" className="nav-btn">
              Regístrate
            </a>
          </nav>
        </div>
      </header>

      <main>
        <div className="form-container">
          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Dirección de correo electrónico</label>
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

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" id="remember" />
                <span className="checkbox-label">Recordarme</span>
              </label>
              <a href="/forgot-password" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="submit-btn">
              Ingresar
            </button>

            <div className="register-link">
              <p>
                ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
              </p>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default Login;

import { useState } from "react";
import "./login.css";
import logo from "./logo.svg";
import { supabase } from "./supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Credenciales incorrectas o cuenta no confirmada");
      return;
    }

    // Guardar token de sesión
    const token = data.session.access_token;
    localStorage.setItem("token", token);

    alert("Inicio de sesión exitoso");

    // Redirección (luego la cambias)
    window.location.href = "/catalogo";
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
            <a href="/registro" className="nav-btn">Regístrate</a>
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

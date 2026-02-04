// mercapleno-backend/routes/usuarios.js
const express = require("express");
const router = express.Router();
const { query } = require("../db"); //  Importamos la función query
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "yogui"; //  DEBE COINCIDIR CON LA DE authMiddleware.js


// REGISTRO DE USUARIO
router.post("/register", async (req, res) => {
  const { 
    nombre,
    apellido,
    email,
    password,
    direccion,
    fecha_nacimiento,
    id_rol = 3, // Rol por defecto 'Cliente'
    id_tipo_identificacion,
    numero_identificacion
  } = req.body;

  // ---- VALIDACIÓN DE CAMPOS ----
  if (!nombre || !apellido || !email || !password || !direccion || !fecha_nacimiento ||
      !id_tipo_identificacion || !numero_identificacion) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios."
    });
  }

  // --- HASH DE CONTRASEÑA ---
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // --- INSERCIÓN ---
  const sql = `
    INSERT INTO usuarios (nombre, apellido, email, password, direccion, fecha_nacimiento, id_rol, id_tipo_identificacion, numero_identificacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await query(sql, [
      nombre,
      apellido,
      email,
      hashedPassword,
      direccion,
      fecha_nacimiento,
      id_rol,
      id_tipo_identificacion,
      numero_identificacion
    ]);
    res.json({ success: true, message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error al registrar usuario:", err.message);
    // Error 1062 es duplicado
    if (err.errno === 1062) { 
        return res.status(409).json({ success: false, message: "El email o número de identificación ya están registrados." });
    }
    res.status(500).json({ success: false, message: "Error interno del servidor al registrar." });
  }
});

// LOGIN DE USUARIO
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email y contraseña requeridos" });
  }

  const sql = `
    SELECT u.id, u.password, u.nombre, u.apellido, u.email, u.id_rol, r.nombre AS nombre_rol,
    t.nombre AS tipo_identificacion
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id
    LEFT JOIN tipos_identificacion t ON u.id_tipo_identificacion = t.id
    WHERE u.email = ?
  `;

  try {
    const [results] = await query(sql, [email]); 

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }

    // --- Generar token ---
    const token = jwt.sign(
      { id: user.id, id_rol: user.id_rol, email: user.email },
      SECRET_KEY,
      { expiresIn: "2h" }
    );


    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        id_rol: user.id_rol,
        rol: user.nombre_rol,
        tipo_documento: user.tipo_identificacion
      }
    });

  } catch (err) {
    console.error("Error en el login:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});


// LOGOUT (Simulado)
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Sesión cerrada (token invalidado por el cliente)" });
});


module.exports = router;
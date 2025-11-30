const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// ======================
// REGISTRO DE USUARIO
// ======================
router.post("/register", async (req, res) => {
  const { nombre, apellido, email, password, direccion, fecha_nacimiento } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Datos incompletos" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO usuarios (nombre, apellido, email, password, direccion, fecha_nacimiento)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [nombre, apellido, email, hashedPassword, direccion, fecha_nacimiento],
      (err) => {
        if (err) {
          console.log(err);
          return res.json({ success: false, message: "Error en la base de datos" });
        }

        res.json({ success: true, message: "Registro exitoso" });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

// ======================
// LOGIN DE USUARIO
// ======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Faltan datos" });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Error en la base de datos" });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    const user = results[0];

    // Validar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.json({ success: false, message: "Contraseña incorrecta" });
    }

    // === Login exitoso ===
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email
      }
    });
  });
});

// ======================
// LOGOUT
// ======================
// El backend realmente no "cierra sesión"
// Solo se usa en el frontend borrando el token.
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Sesión cerrada" });
});

module.exports = router;

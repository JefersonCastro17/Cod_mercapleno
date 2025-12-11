const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "yogui"; // .env, no se que es


// =======================================
// FUNCIÓN SEGURA PARA CONSULTAR LA BD
// =======================================
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("Error SQL:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
}

// ======================
// REGISTRO DE USUARIO
// ======================
router.post("/register", async (req, res) => {
  const { 
    nombre,
    apellido,
    email,
    password,
    direccion,
    fecha_nacimiento,
    id_rol,
    id_tipo_identificacion,
    numero_identificacion
  } = req.body;

  // ---- VALIDACIÓN DE CAMPOS ----
  if (!nombre || !apellido || !email || !password || !direccion || !fecha_nacimiento ||
      !id_tipo_identificacion || !numero_identificacion) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener mínimo 6 caracteres"
    });
  }

  const fecha = new Date(fecha_nacimiento);
  if (isNaN(fecha.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Fecha de nacimiento inválida"
    });
  }

  const hoy = new Date();
  const edad = hoy.getFullYear() - fecha.getFullYear();
  if (edad < 10) {
    return res.status(400).json({
      success: false,
      message: "Debes tener mínimo 10 años"
    });
  }

  try {
    // 1️⃣ Verificar si el correo ya existe
    const sqlCorreo = "SELECT id FROM usuarios WHERE email = ?";
    const correoExiste = await query(sqlCorreo, [email]);

    if (correoExiste.length > 0) {
      return res.json({ success: false, message: "El correo ya está registrado" });
    }

    // 2️⃣ Verificar si el documento ya existe
    const sqlDoc = "SELECT id FROM usuarios WHERE numero_identificacion = ?";
    const docExiste = await query(sqlDoc, [numero_identificacion]);

    if (docExiste.length > 0) {
      return res.json({ success: false, message: "Este número de documento ya está registrado" });
    }

    // 3️⃣ Validar tipo de identificación
    const sqlTipo = "SELECT id FROM tipos_identificacion WHERE id = ?";
    const tipoValido = await query(sqlTipo, [id_tipo_identificacion]);

    if (!tipoValido || tipoValido.length === 0) {
      return res.json({ success: false, message: "Tipo de identificación no válido" });
    }

    // 4️⃣ Validar rol
    const rolAsignado = id_rol || 3; // Rol por defecto → cliente
    const sqlRol = "SELECT id FROM roles WHERE id = ?";
    const rolValido = await query(sqlRol, [rolAsignado]);

    if (!rolValido || rolValido.length === 0) {
      return res.json({ success: false, message: "Rol no válido" });
    }

    // 5️⃣ Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Insertar usuario
    const sqlInsert = `
      INSERT INTO usuarios 
      (nombre, apellido, email, password, direccion, fecha_nacimiento,
       id_rol, id_tipo_identificacion, numero_identificacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sqlInsert, [
      nombre,
      apellido,
      email,
      hashedPassword,
      direccion,
      fecha_nacimiento,
      rolAsignado,
      id_tipo_identificacion,
      numero_identificacion
    ]);

    res.json({ success: true, message: "Registro exitoso" });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});


// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Faltan datos" });
  }

const sql = `
  SELECT 
    u.*, 
    r.nombre AS nombre_rol,
    t.nombre AS tipo_identificacion
  FROM usuarios u
  LEFT JOIN roles r ON u.id_rol = r.id
  LEFT JOIN tipos_identificacion t ON u.id_tipo_identificacion = t.id
  WHERE u.email = ?
`;


  try {
    const results = await query(sql, [email]);

    if (results.length === 0) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.json({ success: false, message: "Contraseña incorrecta" });
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
      tipo_documento: user.tipo_identificacion,
      documento: user.numero_identificacion
  }
});

  } catch (error) {
    console.error("Error en login:", error);
    res.json({ success: false, message: "Error en la base de datos" });
  }
});



// ======================
// LOGOUT
// ======================
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Sesión cerrada" });
});

module.exports = router;

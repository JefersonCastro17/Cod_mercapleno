const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "yogui"; // el mismo que usas para login

// Función de consulta segura
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// Middleware para proteger rutas con token
function autenticar(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ success: false, message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
}

// ==============================
// RUTA: Estadísticas de usuarios
// ==============================
router.get("/", autenticar, async (req, res) => {
  try {
    // 1️⃣ Total de usuarios por rol
    const usuariosPorRol = await query(`
      SELECT r.nombre AS rol, COUNT(u.id) AS total
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id
      GROUP BY r.nombre
    `);

    // 2️⃣ Cantidad de usuarios por tipo de identificación
    const usuariosPorTipoId = await query(`
      SELECT t.nombre AS tipo_identificacion, COUNT(u.id) AS total
      FROM usuarios u
      LEFT JOIN tipos_identificacion t ON u.id_tipo_identificacion = t.id
      GROUP BY t.nombre
    `);

    // 3️⃣ Usuarios agregados por mes (usando fecha de creación)
    const usuariosPorMes = await query(`
      SELECT DATE_FORMAT(fecha_nacimiento, '%Y-%m') AS mes, COUNT(id) AS total
      FROM usuarios
      WHERE fecha_nacimiento IS NOT NULL
      GROUP BY DATE_FORMAT(fecha_nacimiento, '%Y-%m')
      ORDER BY mes DESC
    `);

    res.json({
      success: true,
      usuariosPorRol,
      usuariosPorTipoId,
      usuariosPorMes,
    });

  } catch (error) {
    console.error("Error en estadísticas:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

module.exports = router;

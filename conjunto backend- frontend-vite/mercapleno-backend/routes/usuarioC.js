// mercapleno-backend/routes/usuarioC.js
const express = require("express");
const router = express.Router();
const { query } = require("../db");
const { verifyToken } = require("./authMiddleware");
const bcrypt = require("bcryptjs");

router.use(verifyToken);

// GET: LISTAR USUARIOS
router.get("/", async (req, res) => {
  const sql = `
    SELECT u.id, u.nombre, u.apellido, u.email, u.direccion, u.fecha_nacimiento, r.nombre AS rol,
           t.nombre AS tipo_identificacion, u.numero_identificacion, u.id_rol, u.id_tipo_identificacion
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id
    LEFT JOIN tipos_identificacion t ON u.id_tipo_identificacion = t.id
  `;

  try {
    const [results] = await query(sql);
    return res.json({ success: true, usuarios: results });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return res.status(500).json({ success: false, message: "Error al obtener usuarios" });
  }
});

// POST: INSERTAR USUARIO
router.post("/", async (req, res) => {
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

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const sql = `
    INSERT INTO usuarios (nombre, apellido, email, password, direccion, fecha_nacimiento, id_rol, id_tipo_identificacion, numero_identificacion, email_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
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
    return res.json({ success: true, message: "Usuario agregado correctamente" });
  } catch (err) {
    console.error("Error al insertar usuario:", err);
    return res.status(500).json({ success: false, message: "Error al insertar usuario" });
  }
});

// PUT: ACTUALIZAR USUARIO
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    email,
    direccion,
    fecha_nacimiento,
    id_rol,
    id_tipo_identificacion,
    numero_identificacion,
    password
  } = req.body;

  let sql = `
    UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, direccion = ?, fecha_nacimiento = ?, id_rol = ?, id_tipo_identificacion = ?, numero_identificacion = ?
    WHERE id = ?
  `;
  let params = [nombre, apellido, email, direccion, fecha_nacimiento, id_rol, id_tipo_identificacion, numero_identificacion, id];

  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    sql = `
      UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, password = ?, direccion = ?, fecha_nacimiento = ?, id_rol = ?, id_tipo_identificacion = ?, numero_identificacion = ?
      WHERE id = ?
    `;
    params = [nombre, apellido, email, hashedPassword, direccion, fecha_nacimiento, id_rol, id_tipo_identificacion, numero_identificacion, id];
  }

  try {
    const [result] = await query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.json({ success: true, message: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    return res.status(500).json({ success: false, message: "Error al actualizar usuario" });
  }
});

// DELETE: ELIMINAR USUARIO
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM usuarios WHERE id = ?";

  try {
    const [result] = await query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    return res.status(500).json({ success: false, message: "Error al eliminar usuario" });
  }
});

module.exports = router;

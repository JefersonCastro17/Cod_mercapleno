const express = require("express");
const router = express.Router();
const db = require("../db");

// =====================
// GET: LISTAR USUARIOS
// =====================
router.get("/", (req, res) => {
  const sql = "SELECT * FROM usuarios";

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Error al obtener usuarios" });
    }

    res.json({ success: true, usuarios: results });
  });
});

// =====================
// POST: INSERTAR USUARIO
// =====================
router.post("/", (req, res) => {
  const { nombre, apellido, email, password, direccion, fecha_nacimiento } = req.body;

  if (!nombre || !apellido || !email) {
    return res.json({ success: false, message: "Faltan datos" });
  }

  const sql = `
    INSERT INTO usuarios (nombre, apellido, email, password, direccion, fecha_nacimiento)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nombre, apellido, email, password, direccion, fecha_nacimiento], (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Error al insertar usuario" });
    }

    res.json({ success: true, message: "Usuario agregado correctamente" });
  });
});

// =====================
// PUT: ACTUALIZAR USUARIO
// =====================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, direccion, fecha_nacimiento } = req.body;

  const sql = `
    UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, direccion = ?, fecha_nacimiento = ?
    WHERE id = ?
  `;

  db.query(sql, [nombre, apellido, email, direccion, fecha_nacimiento, id], (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Error al actualizar usuario" });
    }

    res.json({ success: true, message: "Usuario actualizado correctamente" });
  });
});

// =====================
// DELETE: ELIMINAR USUARIO
// =====================
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM usuarios WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Error al eliminar usuario" });
    }

    res.json({ success: true, message: "Usuario eliminado correctamente" });
  });
});

module.exports = router;

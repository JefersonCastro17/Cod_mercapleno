const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   LISTAR
========================= */
router.get("/", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, rows) => {
    if (err) {
      console.log(err);
      return res.json({ success: false });
    }
    res.json({ success: true, usuarios: rows });
  });
});

/* =========================
   CREAR
========================= */
router.post("/", (req, res) => {
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
    return res.json({ success: false, message: "Datos incompletos" });
  }

  const sql = `
    INSERT INTO usuarios (
      nombre, apellido, email, password, direccion,
      fecha_nacimiento, fecha_registro,
      id_rol, id_tipo_identificacion, numero_identificacion
    )
    VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nombre,
      apellido,
      email,
      password,
      direccion,
      fecha_nacimiento,
      Number(id_rol),
      Number(id_tipo_identificacion),
      numero_identificacion
    ],
    (err) => {
      if (err) {
        console.log("ERROR INSERT:", err);
        return res.json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

/* =========================
   ACTUALIZAR
========================= */
router.put("/:id", (req, res) => {
  const {
    nombre,
    apellido,
    email,
    direccion,
    fecha_nacimiento,
    id_rol,
    id_tipo_identificacion,
    numero_identificacion
  } = req.body;

  const sql = `
    UPDATE usuarios SET
      nombre = ?,
      apellido = ?,
      email = ?,
      direccion = ?,
      fecha_nacimiento = ?,
      id_rol = ?,
      id_tipo_identificacion = ?,
      numero_identificacion = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nombre,
      apellido,
      email,
      direccion,
      fecha_nacimiento,
      Number(id_rol),
      Number(id_tipo_identificacion),
      numero_identificacion,
      req.params.id
    ],
    (err) => {
      if (err) {
        console.log("ERROR UPDATE:", err);
        return res.json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

/* =========================
   ELIMINAR
========================= */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      console.log("ERROR DELETE:", err);
      return res.json({ success: false });
    }
    res.json({ success: true });
  });
});

module.exports = router;

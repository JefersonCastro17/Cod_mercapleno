const express = require("express");
const db = require("../db.js");
const router = express.Router();

// GET productos
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      p.id_productos,
      p.nombre,
      p.precio,
      p.descripcion,
      p.estado,
      c.nombre AS categoria,
      s.stock,
      s.fecha_vencimiento
    FROM productos p
    LEFT JOIN stock_actual s ON p.id_productos = s.id_productos
    LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Error al obtener productos", err });
    res.json({ success: true, productos: rows });
  });
});

// PUT actualizar stock
router.put("/stock/:id", (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  if (stock < 0) return res.status(400).json({ success: false, message: "Stock no puede ser negativo" });

  db.query("SELECT id_inventario FROM stock_actual WHERE id_productos = ?", [id], (err, exist) => {
    if (err) return res.status(500).json({ success: false, message: "Error al verificar stock" });

    if (exist.length > 0) {
      db.query("UPDATE stock_actual SET stock = ? WHERE id_productos = ?", [stock, id], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Error al actualizar stock" });
        res.json({ success: true, message: "Stock actualizado correctamente" });
      });
    } else {
      db.query("INSERT INTO stock_actual (id_productos, stock) VALUES (?, ?)", [id, stock], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Error al insertar stock" });
        res.json({ success: true, message: "Stock creado correctamente" });
      });
    }
  });
});

// PUT editar producto
router.put("/editar/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, precio, descripcion, estado } = req.body;
  if (!nombre || !estado) return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });

  const sql = `
    UPDATE productos SET 
      nombre = ?, 
      precio = ?, 
      descripcion = ?, 
      estado = ?
    WHERE id_productos = ?
  `;
  db.query(sql, [nombre, precio || 0, descripcion || "", estado, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error al editar producto", err });
    res.json({ success: true, message: "Producto editado correctamente" });
  });
});

// DELETE producto
router.delete("/eliminar/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM productos WHERE id_productos = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Error al eliminar producto", err });
    res.json({ success: true, message: "Producto eliminado correctamente" });
  });
});

module.exports = router;

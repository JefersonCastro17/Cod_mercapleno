const express = require("express");
const router = express.Router();
const db = require("../db");
const PDFDocument = require("pdfkit");

// ============================
// 1️⃣ Ventas por mes
// ============================
router.get("/ventas-mes", (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(fecha, '%Y-%m') AS mes,
      IFNULL(SUM(total), 0) AS total
    FROM venta
    GROUP BY mes
    ORDER BY mes
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ============================
// 2️⃣ Top productos
// ============================
router.get("/top-productos", (req, res) => {
  const sql = `
    SELECT 
      p.nombre,
      IFNULL(SUM(vp.cantidad), 0) AS total
    FROM venta_productos vp
    JOIN productos p ON vp.id_productos = p.id_productos
    GROUP BY p.nombre
    ORDER BY total DESC
    LIMIT 10
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ============================
// 3️⃣ KPIs generales
// ============================
router.get("/resumen", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total_ventas,
      IFNULL(SUM(total), 0) AS dinero_total,
      IFNULL(AVG(total), 0) AS promedio
    FROM venta
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// ============================
// 4️⃣ Resumen por mes (tabla)
// ============================
router.get("/resumen-mes", (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(fecha, '%Y-%m') AS mes,
      COUNT(*) AS cantidad_ventas,
      IFNULL(SUM(total), 0) AS total_mes
    FROM venta
    GROUP BY mes
    ORDER BY mes
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.get("/ventas-mes", (req, res) => {
  const { inicio, fin } = req.query;

  let sql = `
    SELECT 
      DATE_FORMAT(fecha, '%Y-%m') AS mes,
      IFNULL(SUM(total), 0) AS total
    FROM venta
  `;

  if (inicio && fin) {
    sql += ` WHERE DATE_FORMAT(fecha, '%Y-%m') BETWEEN ? AND ? `;
  }

  sql += ` GROUP BY mes ORDER BY mes`;

  const params = inicio && fin ? [inicio, fin] : [];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


// ============================
// 5️⃣ PDF
// ============================
router.get("/pdf-resumen", (req, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=reporte_ventas.pdf"
  );

  doc.pipe(res);

  doc.fontSize(20).text("Reporte General de Ventas", { align: "center" });
  doc.moveDown();

  db.query(
    "SELECT COUNT(*) total, IFNULL(SUM(total),0) dinero FROM venta",
    (err, result) => {
      if (err) {
        doc.text("Error al generar reporte");
        doc.end();
        return;
      }

      doc.fontSize(14).text(`Total de ventas: ${result[0].total}`);
      doc.text(`Total vendido: $${result[0].dinero}`);
      doc.moveDown();
      doc.text("Reporte generado automáticamente");

      doc.end();
    }
  );
});

module.exports = router;

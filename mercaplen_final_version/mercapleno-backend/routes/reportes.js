// reportes.js (VERSIÓN FINAL Y CORREGIDA)

const express = require("express");
const router = express.Router();
const db = require("../db");
const PDFDocument = require("pdfkit");
const { verifyToken } = require("./authMiddleware");

router.use(verifyToken);

//  Ventas por mes

router.get("/ventas-mes", async (req, res) => {
  const { inicio, fin } = req.query;

  try { 
    let sql = `
SELECT 
DATE_FORMAT(fecha,'%Y-%m') AS mes,
SUM(total) AS total
FROM venta
WHERE 1=1
`;
    const params = [];
    if (inicio) {
      sql += ` AND DATE_FORMAT(fecha,'%Y-%m')>=?`;
      params.push(inicio);
    }
    if (fin) {
      sql += ` AND DATE_FORMAT(fecha,'%Y-%m')<=?`;
      params.push(fin);
    }
    sql += ` GROUP BY mes ORDER BY mes`;

    const [result] = await db.query(sql, params);
    res.json(result);

  } catch (error) { 
    console.error("Error al obtener ventas por mes:", error);
    res.status(500).json({ error: "Error interno al procesar el reporte de ventas por mes." });
  }
});

//  Top productos

router.get("/top-productos", async (req, res) => {
  try { 
    const sql = `
SELECT
p.nombre,
SUM(vp.cantidad) AS total_vendido,
SUM(vp.cantidad * vp.precio) AS total_facturado
FROM venta_productos vp
JOIN productos p ON p.id_productos=vp.id_productos
GROUP BY p.nombre
ORDER BY total_vendido DESC
LIMIT 10
`;
    const [result] = await db.query(sql);
    res.json(result);
  } catch (error) { 
    console.error("Error al obtener top productos:", error);
    res.status(500).json({ error: "Error interno al procesar el reporte de top productos." });
  }
});

// KPIs (CORRECCIÓN CRÍTICA DE CONTEO Y TIPO DE DATO)

router.get("/resumen", async (req, res) => {
  try { 
    const [[result]] = await db.query(`
SELECT
COUNT(*) AS total_ventas,
-- Utiliza CAST/CONVERT para asegurar que los resultados sean NUMÉRICOS
CAST(SUM(COALESCE(total, 0)) AS DECIMAL(10,2)) AS dinero_total,
CAST(AVG(COALESCE(total, 0)) AS DECIMAL(10,2)) AS promedio
FROM venta
`);
    res.json(result);
  } catch (error) { 
    console.error("Error al obtener resumen de KPIs:", error);
    res.status(500).json({ error: "Error interno al procesar el reporte de KPIs." });
  }
});

//  Resumen mensual (CORRECCIÓN DE TIPO DE DATO)

router.get("/resumen-mes", async (req, res) => {
  try { 
    const [result] = await db.query(`
SELECT
DATE_FORMAT(fecha,'%Y-%m') AS mes,
COUNT(*) AS cantidad_ventas,
CAST(SUM(total) AS DECIMAL(10,2)) AS total_mes -- Aseguramos que el total del mes sea NUMÉRICO
FROM venta
GROUP BY mes
ORDER BY mes DESC
`);
    res.json(result);
  } catch (error) { 
    console.error("Error al obtener resumen mensual:", error);
    res.status(500).json({ error: "Error interno al procesar el reporte mensual." });
  }
});

//  PDF

router.get("/pdf-resumen", async (req, res) => {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=reporte_ventas.pdf");
  doc.pipe(res);
  doc.fontSize(20).text("Reporte General de Ventas", { align: "center" });
  doc.moveDown();

  try { 
    const [[r]] = await db.query(`
SELECT COUNT(*) total, SUM(total) dinero FROM venta
`);
    doc.fontSize(14).text(`Total de ventas: ${r.total}`);
    doc.text(`Total vendido: $${r.dinero}`);
  } catch (error) { 
    console.error("Error al generar datos del PDF:", error);
    doc.fontSize(12).text("Error al cargar datos de la base de datos.");
  } finally {
    doc.end();
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../db"); // Tu conexión a la base de datos
const multer = require("multer");
const path = require("path");

// 1. Configuración de almacenamiento para las fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "img/"); // Recuerda crear esta carpeta manualmente en la raíz
    },
    filename: (req, file, cb) => {
        // Usamos Date.now() para evitar nombres duplicados
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// 2. POST: Crear producto (Corregido con Async/Await)
router.post("/", upload.single("imagen"), async (req, res) => {
    try {
        const { nombre, precio, id_categoria, id_proveedor, descripcion, estado } = req.body;
        
        // Si hay una imagen, guardamos la ruta relativa
        const imagenPath = req.file ? `img/${req.file.filename}` : null;

        const sql = `INSERT INTO productos 
            (nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        // En mysql2/promise, db.query devuelve un array [resultado, campos]
        const [result] = await db.query(sql, [
            nombre, 
            precio, 
            id_categoria, 
            id_proveedor, 
            descripcion, 
            estado, 
            imagenPath
        ]);

        res.status(201).json({ 
            message: "Producto creado con éxito", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("❌ Error al insertar en DB:", err);
        res.status(500).json({ 
            message: "Error interno al guardar producto", 
            error: err.message 
        });
    }
});

// 3. GET: Listar productos (Corregido con Async/Await)
router.get("/", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM productos");
        res.json(results);
    } catch (err) {
        console.error("❌ Error al obtener productos:", err);
        res.status(500).json({ 
            message: "Error al obtener la lista de productos", 
            error: err.message 
        });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../db"); 

// Listar productos
// Se añade 'async' y se reemplaza el callback por try/catch y await
router.get("/", async (req, res) => {
    const sql = "SELECT * FROM productos";

    try {
        // Al usar promesas, db.query retorna un array [results, fields]. 
        // Desestructuramos para obtener solo los resultados.
        const [results] = await db.query(sql); 
        res.json(results);
    } catch (err) {
        // Manejo de errores
        return res.status(500).json({ error: "Error al obtener productos", details: err });
    }
});


// Agregar producto
// Se añade 'async' y se reemplaza el callback por try/catch y await
router.post("/", async (req, res) => {
    const { nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen } = req.body;

    const sql = `
        INSERT INTO productos (nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.query(sql, [nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen]);

        res.json({
            message: "Producto agregado correctamente",
            id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: "Error al agregar producto", details: err });
    }
});


// Editar producto
// Se añade 'async' y se reemplaza el callback por try/catch y await
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen } = req.body;

    const sql = `
        UPDATE productos 
        SET nombre = ?, precio = ?, id_categoria = ?, id_proveedor = ?, descripcion = ?, estado = ?, imagen = ?
        WHERE id_productos = ?
    `;

    try {
        const [result] = await db.query(sql, [nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ message: "Producto actualizado correctamente" });
    } catch (err) {
        return res.status(500).json({ error: "Error al actualizar producto", details: err });
    }
});


//Eliminar producto
// Se añade 'async' y se reemplaza el callback por try/catch y await
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM productos WHERE id_productos = ?";

    try {
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente" });
    } catch (err) {
        return res.status(500).json({ error: "Error al eliminar producto", details: err });
    }
});


module.exports = router;
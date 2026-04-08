// C:\Users\5juan\OneDrive\Escritorio\2modulos\mercapleno-backend\controllers\movimientosController.js

const { query, pool } = require('../db');

// Obtener productos y stock actual (JOIN con stock_actual)
async function obtenerTodosLosMovimientos(req, res) {
    try {
        const sql = `
            SELECT p.id_productos AS id, p.nombre, p.precio, p.imagen,
                   c.nombre AS categoria, COALESCE(s.stock, 0) AS stock
            FROM productos p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
            LEFT JOIN stock_actual s ON p.id_productos = s.id_productos
            ORDER BY p.nombre ASC`;
        const [rows] = await query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Error en controlador:", error);
        res.status(500).json({ error: "Error al cargar inventario" });
    }
}

// Registrar en entrada_productos o salida_productos
async function registrarNuevoMovimiento(req, res) {
    const { id_producto, tipo_movimiento, cantidad, id_documento, comentario } = req.body;
    const id_usuario = 1; // ID temporal para evitar error de FK
    const id_mov_db = (tipo_movimiento === 'ENTRADA') ? 2 : 3;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        if (tipo_movimiento === 'ENTRADA') {
            await connection.execute(
                `INSERT INTO entrada_productos (id_productos, cantidad, fecha, observaciones, id_documento, id_usuario, id_movimiento) VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
                [id_producto, cantidad, comentario, id_documento, id_usuario, id_mov_db]
            );
            await connection.execute(`UPDATE stock_actual SET stock = stock + ? WHERE id_productos = ?`, [cantidad, id_producto]);
        } else {
            await connection.execute(
                `INSERT INTO salida_productos (id_productos, cantidad, fecha, id_documento, id_usuario, id_movimiento) VALUES (?, ?, NOW(), ?, ?, ?)`,
                [id_producto, cantidad, id_documento, id_usuario, id_mov_db]
            );
            await connection.execute(`UPDATE stock_actual SET stock = stock - ? WHERE id_productos = ?`, [cantidad, id_producto]);
        }

        await connection.commit();
        res.status(201).json({ message: "Movimiento registrado con éxito" });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en registro:", error);
        res.status(500).json({ error: "No se pudo registrar" });
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { obtenerTodosLosMovimientos, registrarNuevoMovimiento };
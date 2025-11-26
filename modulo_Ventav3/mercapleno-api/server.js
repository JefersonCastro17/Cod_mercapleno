// mercapleno-api/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 4000;
const DB_NAME = 'taller_4';

// --- CONFIGURACIÓN DE LA BASE DE DATOS (MYSQL/PHPMYADMIN) ---
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Asegúrate de que esta contraseña sea correcta
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ENDPOINTS DE LA API (RUTAS) ---

// 1. RUTA GET: Obtener el catálogo de productos
app.get('/api/products', async (req, res) => {
    console.log("Petición GET /api/products recibida.");
    
    // Consulta con p.img y c.nombre corregidos
    const query = `
        SELECT 
            p.id_productos AS id, 
            p.nombre, 
            p.precio, 
            c.nombre AS category,   
            p.img AS image,         
            COALESCE(sa.stock, 0) AS stock 
        FROM productos p
        LEFT JOIN stock_actual sa ON p.id_productos = sa.id_productos
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria 
        WHERE COALESCE(sa.stock, 0) > 0;
    `;
    
    try {
        const [rows] = await pool.query(query);
        
        const products = rows.map(row => ({
            id: row.id.toString(), 
            nombre: row.nombre,
            price: row.precio,
            category: row.category, 
            image: row.image,
            stock: row.stock 
        }));

        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener productos de la BD:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar productos." });
    }
});


// 2. RUTA POST: Registrar una nueva orden de compra y actualizar inventario
app.post('/api/orders', async (req, res) => {
    const { items, total } = req.body;
    
    // ***************************************************************
    // CORRECCIÓN: Usamos '1' como ID de usuario (el más probable que exista).
    const MOCK_USER_ID = '1'; 
    // ***************************************************************
    const MOCK_METODO_ID = '1'; 
    const MOCK_DOCUMENTO_ID = '4'; // Asumimos que esta corrección es correcta
    const MOCK_MOVIMIENTO_ID = '2'; // Asumimos que 2 es 'SALIDA'/'VENTA' 

    if (!items || items.length === 0 || total === undefined) {
         return res.status(400).json({ error: "Datos de orden incompletos o inválidos." });
    }

    const connection = await pool.getConnection(); 
    
    try {
        await connection.beginTransaction(); // INICIAR TRANSACCIÓN

        // --- A. INSERTAR EN LA TABLA 'VENTA' ---
        // Si MOCK_USER_ID o MOCK_METODO_ID no existen, esta línea falla y causa el error 'id_venta=0'.
        const insertVentaQuery = `
            INSERT INTO venta (id_documento, id_usuario, id_metodo, fecha, total) 
            VALUES (?, ?, ?, NOW(), ?);
        `;
        const [ventaResult] = await connection.query(insertVentaQuery, [MOCK_DOCUMENTO_ID, MOCK_USER_ID, MOCK_METODO_ID, total]);
        const id_venta = ventaResult.insertId; 
        
        if (id_venta === 0) {
             // Esta verificación rara vez se necesita si el catch funciona, pero es un buen respaldo.
             throw new Error("La inserción de la venta falló, no se generó un ID de venta.");
        }

        // --- B. PROCESAR CADA PRODUCTO EN LA ORDEN ---
        for (const item of items) {
            const id_producto = item.id;
            const cantidad = item.cantidad;

            // 1. Insertar en la tabla 'venta_productos' (Ahora con id_venta válido)
            const insertVentaProductoQuery = `
                INSERT INTO venta_productos (id_venta, id_productos, cantidad) 
                VALUES (?, ?, ?);
            `;
            await connection.query(insertVentaProductoQuery, [id_venta, id_producto, cantidad]);

            // 2. Insertar en la tabla 'salida_productos' (Movimiento de inventario)
            const insertSalidaQuery = `
                INSERT INTO salida_productos (id_productos, id_movimiento, cantidad) 
                VALUES (?, ?, ?); 
            `;
            await connection.query(insertSalidaQuery, [id_producto, MOCK_MOVIMIENTO_ID, cantidad]);

            // 3. ACTUALIZAR STOCK ACTUAL
            const updateStockQuery = `
                UPDATE stock_actual SET stock = stock - ? WHERE id_productos = ?;
            `;
            const [updateResult] = await connection.query(updateStockQuery, [cantidad, id_producto]);
            
            if (updateResult.affectedRows === 0) {
                 // Si falla, revertimos toda la transacción
                 throw new Error(`Fallo al actualizar stock para producto ID: ${id_producto}.`);
            }
        }

        await connection.commit(); // CONFIRMAR TRANSACCIÓN
        
        console.log(`Transacción completada, Venta ID: ${id_venta}`);

        res.status(201).json({ 
            message: "Venta registrada con éxito", 
            id: id_venta.toString(),
            total: total
        });

    } catch (error) {
        await connection.rollback(); // DESHACER SI HAY ERROR
        console.error("Error en la transacción de venta:", error);
        res.status(500).json({ 
            error: "Fallo al procesar la venta y actualizar el inventario",
            details: error.message
        });
    } finally {
        connection.release(); // LIBERAR LA CONEXIÓN
    }
});


// --- 3. INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
    console.log(` API REST escuchando en http://localhost:4000:${PORT}`);
});
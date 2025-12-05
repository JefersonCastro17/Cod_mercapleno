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
    password: '', 
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ENDPOINTS DE LA API (RUTAS) ---

// 1. RUTA GET: Obtener el catálogo de productos (CON FILTROS DINÁMICOS SQL)
app.get('/api/products', async (req, res) => {
    // Capturamos todos los query parameters
    const { search, category, precioMin, precioMax } = req.query; 

    console.log(`Petición GET /api/products recibida. Filtros: { search: "${search}", category: "${category}", min: ${precioMin}, max: ${precioMax} }`);
    
    // Base de la consulta, incluyendo JOINS
    let query = `
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
        WHERE COALESCE(sa.stock, 0) > 0
    `;
    
    const params = [];

    // --- APLICACIÓN DINÁMICA DE FILTROS SQL ---

    // Filtro por Categoría
    if (category) {
        query += ` AND LOWER(c.nombre) = LOWER(?)`; 
        params.push(category);
    }

    // Filtro por Búsqueda de Nombre
    if (search) {
        query += ` AND p.nombre LIKE ?`;
        params.push(`%${search}%`); 
    }

    // Filtro por Precio Mínimo (Consulta de Rango)
    const min = parseFloat(precioMin);
    if (!isNaN(min) && min >= 0) {
        query += ` AND p.precio >= ?`;
        params.push(min);
    }

    // Filtro por Precio Máximo (Consulta de Rango)
    const max = parseFloat(precioMax);
    if (!isNaN(max) && max >= 0) {
        query += ` AND p.precio <= ?`;
        params.push(max);
    }

    query += ` ORDER BY p.nombre ASC;`; 

    try {
        const [rows] = await pool.query(query, params); 
        
        const products = rows.map(row => ({
            id: row.id.toString(), 
            nombre: row.nombre,
            price: row.precio,
            category: row.category ? row.category.toLowerCase() : 'otros', 
            image: row.image,
            stock: row.stock 
        }));

        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener productos de la BD:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar productos." });
    }
});


// 2. RUTA GET: Obtener categorías disponibles (NUEVA RUTA con Agregación y JOIN)
app.get('/api/categories', async (req, res) => {
    console.log("Petición GET /api/categories recibida.");
    
    // Consulta SQL con Agregación (COUNT) para mostrar solo categorías con stock
    const query = `
        SELECT 
            c.nombre AS category, 
            COUNT(p.id_productos) AS product_count
        FROM categoria c
        JOIN productos p ON c.id_categoria = p.id_categoria
        JOIN stock_actual sa ON p.id_productos = sa.id_productos
        WHERE sa.stock > 0
        GROUP BY c.nombre
        ORDER BY c.nombre;
    `;
    
    try {
        const [rows] = await pool.query(query);
        
        const categories = rows.map(row => ({
            value: row.category.toLowerCase(), 
            label: row.category.charAt(0).toUpperCase() + row.category.slice(1),
            count: row.product_count 
        }));

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error al obtener categorías de la BD:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar categorías." });
    }
});


// 3. RUTA POST: Registrar una nueva orden de compra y actualizar inventario (Mantenida)
app.post('/api/orders', async (req, res) => {
    const { items, total } = req.body;
    
    // MOCK IDs
    const MOCK_USER_ID = '1'; 
    const MOCK_METODO_ID = '1'; 
    const MOCK_DOCUMENTO_ID = '4'; 
    const MOCK_MOVIMIENTO_ID = '2'; 

    if (!items || items.length === 0 || total === undefined) {
          return res.status(400).json({ error: "Datos de orden incompletos o inválidos." });
    }

    const connection = await pool.getConnection(); 
    
    try {
        await connection.beginTransaction(); // INICIAR TRANSACCIÓN

        // A. INSERTAR EN LA TABLA 'VENTA' 
        const insertVentaQuery = `
            INSERT INTO venta (id_documento, id_usuario, id_metodo, fecha, total) 
            VALUES (?, ?, ?, NOW(), ?);
        `;
        const [ventaResult] = await connection.query(insertVentaQuery, [MOCK_DOCUMENTO_ID, MOCK_USER_ID, MOCK_METODO_ID, total]);
        const id_venta = ventaResult.insertId; 
        
        if (id_venta === 0) {
              throw new Error("La inserción de la venta falló, no se generó un ID de venta.");
        }

        // B. PROCESAR CADA PRODUCTO EN LA ORDEN
        for (const item of items) {
            const id_producto = item.id;
            const cantidad = item.cantidad;

            // 1. Insertar en la tabla 'venta_productos'
            const insertVentaProductoQuery = `
                INSERT INTO venta_productos (id_venta, id_productos, cantidad) 
                VALUES (?, ?, ?);
            `;
            await connection.query(insertVentaProductoQuery, [id_venta, id_producto, cantidad]);

            // 2. Insertar en la tabla 'salida_productos'
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


// --- 4. INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 API REST escuchando en http://localhost:${PORT}`);
});
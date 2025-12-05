// mercapleno-api/productModel.js

const { pool } = require('./db'); // Importamos el pool de conexiones

// ------------------------------------------
// Lógica para Obtener Productos y Categorías
// ------------------------------------------

/**
 * Obtiene el listado de productos aplicando filtros dinámicos.
 */
const getFilteredProducts = async ({ search, category, precioMin, precioMax }) => {
    
    // Base de la consulta
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

    const [rows] = await pool.query(query, params); 
    
    return rows.map(row => ({
        id: row.id.toString(), 
        nombre: row.nombre,
        price: row.precio,
        category: row.category ? row.category.toLowerCase() : 'otros', 
        image: row.image,
        stock: row.stock 
    }));
};

/**
 * Obtiene las categorías disponibles con productos en stock.
 */
const getAvailableCategories = async () => {
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
    
    const [rows] = await pool.query(query);
    
    return rows.map(row => ({
        value: row.category.toLowerCase(), 
        label: row.category.charAt(0).toUpperCase() + row.category.slice(1),
        count: row.product_count 
    }));
};

// ------------------------------------------
// Lógica para Procesar Órdenes (Transacción)
// ------------------------------------------

/**
 * Registra una nueva venta y actualiza el inventario en una transacción.
 */
const registerOrderAndHandleInventory = async (items, total) => {
    // MOCK IDs
    const MOCK_USER_ID = '1'; 
    const MOCK_METODO_ID = '1'; 
    const MOCK_DOCUMENTO_ID = '4'; 
    const MOCK_MOVIMIENTO_ID = '2'; 

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
        
        return { id_venta: id_venta.toString(), total };

    } catch (error) {
        await connection.rollback(); // DESHACER SI HAY ERROR
        throw error; // Re-lanzar el error para que el controlador lo maneje
    } finally {
        connection.release(); // LIBERAR LA CONEXIÓN
    }
};


// Exportamos todas las funciones de interacción con la BD
module.exports = {
    getFilteredProducts,
    getAvailableCategories,
    registerOrderAndHandleInventory,
};
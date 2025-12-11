const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
const PORT = 5000;


app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mercapleno' 
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return
    }
    console.log('Conexión exitosa a MySQL (phpMyAdmin).');
});


// ➕ RUTA POST (Crear) - CORREGIDA (Sin id_productos en el INSERT)
app.post('/api/productos', (req, res) => {
    const { nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen } = req.body;
    const sql = 'INSERT INTO productos (nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen], (err, resultado) => {
        if (err) {
            console.error('Error al insertar el producto:', err);
            return res.status(500).json({ error: 'Error al guardar el producto. Verifique los datos (ej. claves foráneas o precio).' });
        }

        console.log('Producto insertado con ID:', resultado.insertId);
        res.status(201).json({
            message: 'Producto guardado con éxito',
            id: resultado.insertId 
        });
    });
});


// 👁️ RUTA GET (Leer)
app.get('/api/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';

    db.query(sql, (err, resultados) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            return res.status(500).json({ error: 'Error interno del servidor al obtener productos.' });
        }

        res.status(200).json(resultados);
    });
});


// ✏️ RUTA PUT (Actualizar) - MEJORADA para manejo de precio
app.put('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen } = req.body;
    
    const precioNumerico = parseFloat(precio) || 0; // Asegura que el precio sea un número

    const sql = `
        UPDATE productos 
        SET nombre = ?, precio = ?, id_categoria = ?, id_proveedor = ?, descripcion = ?, estado = ?, imagen = ?
        WHERE id_productos = ?
    `;

    db.query(sql, [nombre, precioNumerico, id_categoria, id_proveedor, descripcion, estado, imagen, id], (err, resultado) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            return res.status(500).json({ error: 'Error al actualizar el producto. Verifique los datos (ej. claves foráneas o precio).' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado para actualizar.' });
        }

        console.log('Producto actualizado con ID:', id);
        res.status(200).json({
            message: `Producto con ID ${id} actualizado con éxito`
        });
    });
});

// 🗑️ RUTA DELETE (Eliminar) - CORREGIDA para MÚLTIPLES Claves Foráneas
app.delete('/api/productos/:id', (req, res) => {
    const id = req.params.id; 
    
    // 1. ELIMINAR REGISTROS EN venta_productos
    const sql_delete_ventas = 'DELETE FROM venta_productos WHERE id_productos = ?';

    db.query(sql_delete_ventas, [id], (err, ventasResult) => {
        if (err) {
            console.error('Error al limpiar registros de venta_productos:', err);
            return res.status(500).json({ error: 'Error interno del servidor al limpiar registros de ventas.' });
        }

        // 2. ELIMINAR REGISTROS EN stock_actual
        const sql_delete_stock = 'DELETE FROM stock_actual WHERE id_productos = ?';
        
        db.query(sql_delete_stock, [id], (err, stockResult) => {
            if (err) {
                console.error('Error al intentar limpiar el stock (pre-eliminación):', err);
                return res.status(500).json({ error: 'Error interno del servidor al limpiar registros de stock.' });
            }
            
            // 3. LUEGO, ELIMINAR EL PRODUCTO PRINCIPAL
            const sql_delete_producto = 'DELETE FROM productos WHERE id_productos = ?';
            
            db.query(sql_delete_producto, [id], (err, resultado) => {
                if (err) {
                    console.error('Error al eliminar el producto:', err);
                    return res.status(500).json({ error: 'Error interno del servidor al eliminar el producto.' });
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({ message: 'Producto no encontrado.' });
                }

                console.log('Producto eliminado con ID:', id);
                res.status(200).json({
                    message: `Producto con ID ${id} y sus dependencias eliminados con éxito`
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Node.js escuchando en el puerto ${PORT}`);
});
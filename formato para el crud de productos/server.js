// server.js
const express = require('express');
const cors = require('cors');

// AQUÍ IMPORTAMOS TU ARCHIVO DB.JS
// Ya no necesitamos importar mysql2 aquí, porque db.js ya trae la conexión lista
const db = require('./db'); 

const app = express();
const port = 3306;

app.use(cors());
app.use(express.json());

// ... A partir de aquí, tus rutas siguen funcionando IGUAL ...
// ... porque la variable 'db' ahora contiene el pool que exportaste ...

// Ejemplo de tu ruta (NO CAMBIA NADA AQUÍ):
app.get('/api/products', (req, res) => {
    const sql = `
        SELECT p.id_productos, p.nombre, p.precio, p.img, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        ORDER BY p.nombre ASC
    `;
    
    // 'db' viene de tu archivo db.js
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ... Resto de tus rutas (POST, PUT, DELETE) ...

app.listen(port, () => {
    console.log(`🚀 Servidor Backend corriendo en http://localhost:${port}`);
});
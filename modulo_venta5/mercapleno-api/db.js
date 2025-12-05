// mercapleno-api/db.js

const mysql = require('mysql2/promise');

const DB_NAME = 'taller_4';

// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log(`Conexión a la base de datos '${DB_NAME}' configurada.`);

// Exportamos el pool para que otros módulos puedan hacer consultas
module.exports = {
    pool,
};
// mercapleno-backend/db.js (CONEXIÓN ÚNICA Y CENTRALIZADA)

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'mercapleno', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log(`✅ CONEXIÓN CENTRALIZADA a la base de datos 'mercapleno' (Pool) configurada.`);

// Exportamos el pool (para transacciones en productModel) y una función query simple (para consultas)
module.exports = {
    pool,
    // Función de consulta segura usando pool.execute()
    query: (sql, params = []) => pool.execute(sql, params) 
};
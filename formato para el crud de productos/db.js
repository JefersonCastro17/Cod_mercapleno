// db.js
const mysql = require("mysql2");

// Usamos createPool en lugar de createConnection para mejor rendimiento en web
const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "mercapleno", // Asegúrate de que coincida con tu BD (antes usaste taller_4, en tu código pusiste mercapleno)
    waitForConnections: true,
    queueLimit: 0
});

// Probamos la conexión inicial (Opcional, pero bueno para depurar)
connection.getConnection((err, conn) => {
    if (err) {
        console.error("❌ Error de conexion a la BD: " + err.code);
    } else {
        console.log("✅ Conexion exitosa a la base de datos");
        conn.release(); // Importante: liberar la conexión al pool
    }
});

module.exports = connection;
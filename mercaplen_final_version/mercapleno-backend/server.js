// ==================================================
// 🟢 mercapleno-backend/server.js
// Servidor Principal Unificado
// ==================================================

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;

// --- 1. Importar Conexión a Base de Datos ---
// Usamos './db' porque el archivo está en la misma carpeta raíz
const db = require('./db'); 

// --- 2. Importar Routers ---
const usuariosRoutes = require("./routes/usuarios");      
const usuariosCRoutes = require("./routes/usuarioC");    
const salesRouter = require("./routes/salesRouter"); 
const reportesRoutes = require("./routes/reportes"); 
const productosRouter = require("./routes/productos"); 
const movimientosRouter = require("./routes/movimientos"); 

// --- 3. Middleware Global ---
app.use(cors()); // Permite peticiones desde el frontend (React)
app.use(express.json()); // Permite leer cuerpos JSON en req.body

// --- 4. Enrutamiento (Endpoints) ---

// Autenticación (Login/Registro)
app.use("/api/auth", usuariosRoutes);           

// Gestión de usuarios (Admin)
app.use("/api/admin/users", usuariosCRoutes);   

// Productos (Catálogo general)
app.use("/api/productos", productosRouter); 

// Inventario (Entradas, Salidas y Stock Actual)
// Este es el que usa el componente RegistroMovimientos.jsx
app.use("/api/movimientos", movimientosRouter); 

// Reportes de Ventas
app.use("/api/sales/reports", reportesRoutes);      

// Módulo de Catálogo de Ventas y Procesamiento de Ordenes
app.use("/api/sales", salesRouter);

// --- 5. Manejo de Rutas no Encontradas (404) ---
app.use((req, res, next) => {
    res.status(404).json({ message: "La ruta solicitada no existe." });
});

// --- 6. Manejador de Errores Global ---
app.use((err, req, res, next) => {
    console.error("❌ ERROR EN EL SERVIDOR:", err.stack);
    res.status(500).json({ 
        message: "Algo salió mal en el servidor interno.",
        error: err.message 
    });
});

// --- 7. Inicio del Servidor ---
app.listen(PORT, () => { 
    console.log(`=================================================`);
    console.log(` SERVIDOR UNIFICADO CORRIENDO`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`=================================================`);
});
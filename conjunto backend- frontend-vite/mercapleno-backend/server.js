// ==================================================
// 🟢 mercapleno-backend/server.js
// Servidor Principal Unificado
// ==================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Mover arriba con las dependencias
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const app = express();
const PORT = process.env.PORT || 4000;

// --- 1. Importar Conexión a Base de Datos ---
const db = require('./db'); 

// --- 2. Importar Routers ---
const usuariosRoutes = require("./routes/usuarios");      
const usuariosCRoutes = require("./routes/usuarioC");    
const salesRouter = require("./routes/salesRouter"); 
const reportesRoutes = require("./routes/reportes"); 
const productosRouter = require("./routes/productos"); 
const movimientosRouter = require("./routes/movimientos"); 

// --- 3. Middleware Global ---

// Configuración de CORS para permitir a Vite (puerto 5173 o similar)
app.use(cors({
    origin: "*", // En producción, cambia "*" por la URL de tu frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Para leer formularios complejos

// ✅ NUEVO: Servir carpeta de imágenes estáticas
// Esto permite que el frontend vea las fotos en http://localhost:4000/img/nombre.jpg
app.use("/img", express.static(path.join(__dirname, "img")));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- 4. Enrutamiento (Endpoints) ---
app.use("/api/auth", usuariosRoutes);           
app.use("/api/admin/users", usuariosCRoutes);   
app.use("/api/productos", productosRouter); 
app.use("/api/movimientos", movimientosRouter); 
app.use("/api/sales/reports", reportesRoutes);      
app.use("/api/sales", salesRouter);

// --- 5. Manejo de Rutas no Encontradas (404) ---
app.use((req, res) => {
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
    console.log(` API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`=================================================`);
});
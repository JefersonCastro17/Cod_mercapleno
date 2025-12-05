// mercapleno-api/server.js

const express = require('express');
const cors = require('cors');
// Importamos la lógica de la base de datos
const productModel = require('./productModel'); 

const app = express();
const PORT = 4000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ENDPOINTS DE LA API (RUTAS) ---

// 1. RUTA GET: Obtener el catálogo de productos
app.get('/api/products', async (req, res) => {
    // Capturamos todos los query parameters
    const filters = req.query; 

    console.log(`Petición GET /api/products recibida. Filtros: ${JSON.stringify(filters)}`);
    
    try {
        // Llama a la función del modelo, que ejecuta la consulta SQL
        const products = await productModel.getFilteredProducts(filters); 
        
        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar productos." });
    }
});


// 2. RUTA GET: Obtener categorías disponibles
app.get('/api/categories', async (req, res) => {
    console.log("Petición GET /api/categories recibida.");
    
    try {
        // Llama a la función del modelo, que ejecuta la consulta SQL
        const categories = await productModel.getAvailableCategories();
        
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar categorías." });
    }
});


// 3. RUTA POST: Registrar una nueva orden de compra y actualizar inventario
app.post('/api/orders', async (req, res) => {
    const { items, total } = req.body;
    
    if (!items || items.length === 0 || total === undefined) {
          return res.status(400).json({ error: "Datos de orden incompletos o inválidos." });
    }

    try {
        // Llama a la función del modelo, que maneja toda la transacción
        const result = await productModel.registerOrderAndHandleInventory(items, total);
        
        console.log(`Transacción completada, Venta ID: ${result.id_venta}`);

        res.status(201).json({ 
            message: "Venta registrada con éxito", 
            id: result.id_venta,
            total: result.total
        });

    } catch (error) {
        // El error ya fue reportado y la transacción fue revertida en el modelo
        console.error("Error en la transacción de venta:", error.message);
        res.status(500).json({ 
            error: "Fallo al procesar la venta y actualizar el inventario",
            details: error.message
        });
    }
});


// --- 4. INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 API REST escuchando en http://localhost:${PORT}`);
});
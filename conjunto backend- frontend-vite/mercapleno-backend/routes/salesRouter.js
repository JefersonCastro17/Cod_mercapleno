// mercapleno-backend/routes/salesRouter.js (AJUSTADO PARA INCLUIR REPORTES)

const express = require('express');
const router = express.Router();

// IMPORTACIONES
const productModel = require('../productModel'); 
const { StockInsuficienteError } = require('../productModel'); 
const { verifyToken } = require('./authMiddleware'); 

//  NUEVA IMPORTACIÓN: Importar el router de reportes
const reportesRouter = require('./reportes'); 

// RUTAS PARA EL CATÁLOGO (Acceso PROTEGIDO)

// 1. RUTA GET: Obtener productos (Ruta final: /api/sales/products)
router.get('/products', verifyToken, async (req, res) => {
    const filters = req.query; 
    
    try {
        const products = await productModel.getFilteredProducts(filters); 
        res.status(200).json(products);
    } catch (error) {
        console.error("❌ Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar productos." });
    }
});


// 2. RUTA GET: Obtener categorías (Ruta final: /api/sales/categories)
router.get('/categories', verifyToken, async (req, res) => {
    try {
        const categories = await productModel.getAvailableCategories(); 
        res.status(200).json(categories);
    } catch (error) {
        console.error("❌ Error al obtener categorías:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar categorías." });
    }
});


// RUTAS DE REPORTES (Montado como subruta de /api/sales)
// CORRECCIÓN CLAVE: Montamos el router de reportes en /reports
// Ruta final: /api/sales/reports/...
router.use('/reports', reportesRouter); 


// RUTA PARA EL CHECKOUT (SANIDAD Y VALIDACIÓN DE CLAVES)

// 3. RUTA POST: Registrar una nueva orden de compra (Ruta final: /api/sales/orders)
router.post('/orders', verifyToken, async (req, res) => {
    
    const id_usuario = req.user.id; 
    
    // Paso 1: Definir la lógica de saneamiento antes de cualquier operación
    const id_metodo_final = req.body.id_metodo || req.body.metodo_pago;

    // Paso 2: Desestructuramos el resto de variables que sabemos que llegan
    const { items, total } = req.body; 
    
    //  BLOQUE DE DEPURACIÓN CLAVE: Siempre al inicio.
    console.log("=================================================");
    console.log("➡️ Intento de Orden Recibido:");
    console.log(`ID Usuario (del Token): ${id_usuario}`);
    console.log(`id_metodo FINAL (Consolidado): ${id_metodo_final}`); 
    console.log('Cuerpo de la Petición Completo (req.body):', req.body);
    console.log(`total: ${total}`);
    console.log(`items: Array de ${items?.length} productos`); 
    console.log("=================================================");


    // VALIDACIÓN CORREGIDA: Usamos la variable consolidada 'id_metodo_final'
    if (!items || items.length === 0 || total === undefined || total === null || !id_metodo_final) { 
        console.error("❌ VALIDACIÓN FALLIDA: Datos incompletos o inválidos.");
        return res.status(400).json({ error: "Datos de orden incompletos o inválidos." });
    }
    
    try {
        // Usamos la variable consolidada para el modelo
        const result = await productModel.registerOrderAndHandleInventory(items, total, id_usuario, id_metodo_final);
        
        console.log(`✅ Transacción completada, Venta ID: ${result.id_venta}`);

        return res.status(201).json({ 
            message: "Venta registrada con éxito", 
            ticketId: result.id_venta,
            total: result.total
        });

    } catch (error) {
        
        console.error("❌ Error en la transacción de venta:", error.message);
        
        if (error instanceof StockInsuficienteError) {
             return res.status(409).json({ 
                 error: "Stock Insuficiente",
                 message: `El producto ID ${error.id_producto} no tiene la cantidad solicitada disponible.`
             });
        }

        res.status(500).json({ 
            error: "Error Interno del Servidor",
            message: "Fallo al procesar la venta y actualizar el inventario.",
            detail: error.message 
        });
    }
});


module.exports = router;
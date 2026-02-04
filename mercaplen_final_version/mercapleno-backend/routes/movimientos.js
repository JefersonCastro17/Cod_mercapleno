// C:\Users\5juan\OneDrive\Escritorio\2modulos\mercapleno-backend\routes\movimientos.js
const express = require('express');
const router = express.Router();
// El require debe coincidir exactamente con el nombre del archivo en la carpeta controllers
const movimientosController = require('../controllers/movimientosController');

router.get('/productos', movimientosController.obtenerTodosLosMovimientos);
router.post('/registrar', movimientosController.registrarNuevoMovimiento);

module.exports = router;
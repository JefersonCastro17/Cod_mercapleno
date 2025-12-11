const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productosController");

router.post("/", productosController.crearProducto);
router.get("/", productosController.obtenerProductos);
router.put("/:id", productosController.actualizarProducto);
router.delete("/:id", productosController.eliminarProducto);

module.exports = router;

const express = require("express");
const cors = require("cors");

const usuariosRoutes = require("./routes/usuarios");
const usuariosCRoutes = require("./routes/usuarioC");
const productosRoutes = require("./routes/productos");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/", usuariosRoutes);
app.use("/usuarioC", usuariosCRoutes);
app.use("/api/productos", productosRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

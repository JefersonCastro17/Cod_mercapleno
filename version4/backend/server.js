const express = require("express");
const cors = require("cors");
const app = express();
const usuariosRoutes = require("./routes/usuarios");

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", usuariosRoutes);

// Servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});

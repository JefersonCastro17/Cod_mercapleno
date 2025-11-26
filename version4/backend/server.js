const express = require("express");
const cors = require("cors");
const app = express();
const usuariosRoutes = require("./routes/usuarios");

app.use(cors());
app.use(express.json());

// Prefijo para rutas
app.use("/api", usuariosRoutes);

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});

const express = require("express");
const cors = require("cors");
const app = express();
const usuariosRoutes = require("./routes/usuarios");   // Login / Register
const usuariosCRoutes = require("./routes/usuarioC"); // CRUD usuarios

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", usuariosRoutes);              // /login /register /logout
app.use("/usuarioC", usuariosCRoutes);     // /usuarios GET POST PUT DELETE

// Servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});

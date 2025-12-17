const express = require("express");
const cors = require("cors");
const app = express();


const usuariosRoutes = require("./routes/usuarios");   // Login / Register
const usuariosCRoutes = require("./routes/usuarioC"); // CRUD usuarios
const productosRoutes = require("./routes/stock");
const reportesRoutes = require("./routes/reportes");


// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", usuariosRoutes);              // /login /register /logout
app.use("/usuarioC", usuariosCRoutes);     // /usuarios GET POST PUT DELETE
app.use("/stock", productosRoutes);
app.use("/reportes", reportesRoutes);


// Servidor
app.listen(3000, () => {
  console.log("Servidor cornoriendo en http://localhost:3000");
});

const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    title: "Mercapleno API",
    description: "API documentation generated automatically from routes"
  },
  servers: [{ url: "http://localhost:4000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "./server.js",
  "./routes/usuarios.js",
  "./routes/usuarioC.js",
  "./routes/salesRouter.js",
  "./routes/reportes.js",
  "./routes/productos.js",
  "./routes/movimientos.js"
];

swaggerAutogen(outputFile, endpointsFiles, doc);

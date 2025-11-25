const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "prueba"
});

connection.connect(err => {
  if (err) {
    console.log("❌ Error conectando a MySQL:", err);
  } else {
    console.log("✅ MySQL conectado");
  }
});

module.exports = connection;

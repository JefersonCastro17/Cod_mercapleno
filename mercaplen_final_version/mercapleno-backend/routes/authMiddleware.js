// mercapleno-backend/routes/authMiddleware.js

const jwt = require("jsonwebtoken");
//  DEBE USAR UNA VARIABLE DE ENTORNO EN PRODUCCIÓN
const SECRET_KEY = "yogui"; 

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Token requerido" });

  const token = authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // **PUNTO CLAVE DE UNIFICACIÓN**
    req.userId = decoded.id; // ID simple para el Módulo de Venta
    req.user = decoded;      // Objeto completo para el Módulo de Estadísticas/otros
    
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}

//  CORRECCIÓN CLAVE: Exportar como objeto o con un nombre específico (si se importó así)
module.exports = {
    verifyToken // Exportamos la función dentro de un objeto
};
// O si quieres mantener la forma de exportar la función directamente, 
//  Tendrías que corregir *todos* los archivos que lo importan para que no usen llaves.
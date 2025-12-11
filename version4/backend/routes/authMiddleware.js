const jwt = require("jsonwebtoken");
const SECRET_KEY = "yogui"; // Mejor ponerlo en .env

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Token requerido" });

  const token = authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // agregamos info del usuario a la request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
}

module.exports = verifyToken;

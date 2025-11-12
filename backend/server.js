const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(express.json());

const SECRET = 'clave_super_secreta';

// Simulación de base de datos en memoria
let users = [];

// 🔹 Registro de usuario
app.post('/api/auth/register', (req, res) => {
  const { email, password, nombre } = req.body;
  if (!email || !password || !nombre) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Usuario ya existe' });
  }

  users.push({ email, password, nombre });
  res.json({ success: true, message: 'Registro exitoso' });
});

// 🔹 Inicio de sesión
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ email: user.email, nombre: user.nombre }, SECRET, { expiresIn: '1h' });
  res.json({ success: true, message: 'Inicio de sesión exitoso', token });
});

// 🔹 Verificar token
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Falta token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ success: true, user: decoded });
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
});

// 🔹 Cerrar sesión
app.post('/api/auth/logout', (req, res) => {
  // En JWT no se puede invalidar fácilmente, solo eliminar del frontend
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

app.listen(3000, () => console.log('✅ Servidor backend corriendo en http://localhost:3000'));

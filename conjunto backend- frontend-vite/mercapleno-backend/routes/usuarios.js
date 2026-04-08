// mercapleno-backend/routes/usuarios.js
const express = require("express");
const router = express.Router();
const { query } = require("../db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendVerificationCode, sendPasswordResetCode } = require("../services/emailService");
const SECRET_KEY = "yogui"; // DEBE COINCIDIR CON LA DE authMiddleware.js

const EMAIL_VERIFICATION_TTL_MIN = parseInt(process.env.EMAIL_VERIFICATION_TTL_MIN || "15", 10);
const PASSWORD_RESET_TTL_MIN = parseInt(process.env.PASSWORD_RESET_TTL_MIN || "15", 10);

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");
const buildExpiresAt = (minutes) => new Date(Date.now() + minutes * 60 * 1000);
const isExpired = (expiresAt) => !expiresAt || new Date(expiresAt).getTime() < Date.now();

// REGISTRO DE USUARIO
router.post("/register", async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    password,
    direccion,
    fecha_nacimiento,
    id_rol = 3,
    id_tipo_identificacion,
    numero_identificacion
  } = req.body;

  if (
    !nombre ||
    !apellido ||
    !email ||
    !password ||
    !direccion ||
    !fecha_nacimiento ||
    !id_tipo_identificacion ||
    !numero_identificacion
  ) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios."
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationCode = generateCode();
  const verificationHash = hashCode(verificationCode);
  const verificationExpiresAt = buildExpiresAt(EMAIL_VERIFICATION_TTL_MIN);

  const sql = `
    INSERT INTO usuarios (nombre, apellido, email, password, direccion, fecha_nacimiento, id_rol, id_tipo_identificacion, numero_identificacion, email_verified, email_verification_code, email_verification_expires)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `;

  try {
    await query(sql, [
      nombre,
      apellido,
      email,
      hashedPassword,
      direccion,
      fecha_nacimiento,
      id_rol,
      id_tipo_identificacion,
      numero_identificacion,
      verificationHash,
      verificationExpiresAt
    ]);

    let emailSent = false;
    try {
      await sendVerificationCode(email, verificationCode, EMAIL_VERIFICATION_TTL_MIN);
      emailSent = true;
    } catch (mailErr) {
      console.error("No se pudo enviar el correo de verificacion:", mailErr.message);
    }

    return res.json({
      success: true,
      message: emailSent
        ? "Usuario registrado. Enviamos un codigo de verificacion a tu correo."
        : "Usuario registrado, pero no se pudo enviar el correo. Usa reenviar codigo.",
      requiresVerification: true,
      emailSent
    });
  } catch (err) {
    console.error("Error al registrar usuario:", err.message);
    if (err.errno === 1062) {
      return res
        .status(409)
        .json({ success: false, message: "El email o numero de identificacion ya estan registrados." });
    }
    return res.status(500).json({ success: false, message: "Error interno del servidor al registrar." });
  }
});

// LOGIN DE USUARIO
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email y contrasena requeridos" });
  }

  const sql = `
    SELECT u.id, u.password, u.nombre, u.apellido, u.email, u.id_rol, u.email_verified, r.nombre AS nombre_rol,
    t.nombre AS tipo_identificacion
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id
    LEFT JOIN tipos_identificacion t ON u.id_tipo_identificacion = t.id
    WHERE u.email = ?
  `;

  try {
    const [results] = await query(sql, [email]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Contrasena incorrecta" });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Debes verificar tu correo antes de iniciar sesion."
      });
    }

    const token = jwt.sign(
      { id: user.id, id_rol: user.id_rol, email: user.email },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    return res.json({
      success: true,
      message: "Inicio de sesion exitoso",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        id_rol: user.id_rol,
        email_verified: user.email_verified,
        rol: user.nombre_rol,
        tipo_documento: user.tipo_identificacion
      }
    });
  } catch (err) {
    console.error("Error en el login:", err);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// VERIFICAR EMAIL CON CODIGO
router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: "Email y codigo requeridos" });
  }

  try {
    const [results] = await query(
      "SELECT id, email_verified, email_verification_code, email_verification_expires FROM usuarios WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = results[0];

    if (user.email_verified) {
      return res.json({ success: true, message: "El correo ya esta verificado." });
    }

    if (!user.email_verification_code || !user.email_verification_expires) {
      return res.status(400).json({ success: false, message: "No hay un codigo activo. Solicita reenviar." });
    }

    if (isExpired(user.email_verification_expires)) {
      return res.status(400).json({ success: false, message: "El codigo ha expirado. Solicita reenviar." });
    }

    const codeHash = hashCode(code);
    if (codeHash !== user.email_verification_code) {
      return res.status(401).json({ success: false, message: "Codigo incorrecto." });
    }

    await query(
      "UPDATE usuarios SET email_verified = 1, email_verification_code = NULL, email_verification_expires = NULL WHERE id = ?",
      [user.id]
    );

    return res.json({ success: true, message: "Correo verificado correctamente." });
  } catch (err) {
    console.error("Error al verificar correo:", err);
    return res.status(500).json({ success: false, message: "Error interno al verificar correo" });
  }
});

// REENVIAR CODIGO DE VERIFICACION
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email requerido" });
  }

  try {
    const [results] = await query(
      "SELECT id, email_verified FROM usuarios WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = results[0];

    if (user.email_verified) {
      return res.json({ success: true, message: "El correo ya esta verificado." });
    }

    const verificationCode = generateCode();
    const verificationHash = hashCode(verificationCode);
    const verificationExpiresAt = buildExpiresAt(EMAIL_VERIFICATION_TTL_MIN);

    await query(
      "UPDATE usuarios SET email_verification_code = ?, email_verification_expires = ? WHERE id = ?",
      [verificationHash, verificationExpiresAt, user.id]
    );

    await sendVerificationCode(email, verificationCode, EMAIL_VERIFICATION_TTL_MIN);

    return res.json({ success: true, message: "Codigo reenviado. Revisa tu correo." });
  } catch (err) {
    console.error("Error al reenviar codigo:", err);
    return res.status(500).json({ success: false, message: "Error interno al reenviar codigo" });
  }
});

// SOLICITAR CODIGO PARA RECUPERAR CONTRASENA
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email requerido" });
  }

  try {
    const [results] = await query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.json({ success: true, message: "Si el correo existe, se envio un codigo." });
    }

    const user = results[0];
    const resetCode = generateCode();
    const resetHash = hashCode(resetCode);
    const resetExpiresAt = buildExpiresAt(PASSWORD_RESET_TTL_MIN);

    await query(
      "UPDATE usuarios SET password_reset_code = ?, password_reset_expires = ? WHERE id = ?",
      [resetHash, resetExpiresAt, user.id]
    );

    await sendPasswordResetCode(email, resetCode, PASSWORD_RESET_TTL_MIN);

    return res.json({ success: true, message: "Si el correo existe, se envio un codigo." });
  } catch (err) {
    console.error("Error al solicitar recuperacion:", err);
    return res.status(500).json({ success: false, message: "Error interno al solicitar recuperacion" });
  }
});

// RESETEAR CONTRASENA CON CODIGO
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: "Email, codigo y nueva contrasena requeridos" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "La contrasena debe tener al menos 6 caracteres" });
  }

  try {
    const [results] = await query(
      "SELECT id, password_reset_code, password_reset_expires FROM usuarios WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = results[0];

    if (!user.password_reset_code || !user.password_reset_expires) {
      return res.status(400).json({ success: false, message: "No hay un codigo activo. Solicita uno nuevo." });
    }

    if (isExpired(user.password_reset_expires)) {
      return res.status(400).json({ success: false, message: "El codigo ha expirado. Solicita uno nuevo." });
    }

    const codeHash = hashCode(code);
    if (codeHash !== user.password_reset_code) {
      return res.status(401).json({ success: false, message: "Codigo incorrecto." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query(
      "UPDATE usuarios SET password = ?, password_reset_code = NULL, password_reset_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    return res.json({ success: true, message: "Contrasena actualizada correctamente." });
  } catch (err) {
    console.error("Error al resetear contrasena:", err);
    return res.status(500).json({ success: false, message: "Error interno al resetear contrasena" });
  }
});

// LOGOUT (Simulado)
router.post("/logout", (req, res) => {
  return res.json({ success: true, message: "Sesion cerrada (token invalidado por el cliente)" });
});

module.exports = router;

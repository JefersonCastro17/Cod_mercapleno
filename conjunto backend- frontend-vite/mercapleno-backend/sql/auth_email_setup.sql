-- Agregar columnas para verificacion de correo y recuperacion de contrasena
ALTER TABLE usuarios
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN email_verification_code VARCHAR(64) NULL,
  ADD COLUMN email_verification_expires DATETIME NULL,
  ADD COLUMN password_reset_code VARCHAR(64) NULL,
  ADD COLUMN password_reset_expires DATETIME NULL;

-- Opcional: marcar usuarios existentes como verificados para no bloquear accesos
UPDATE usuarios SET email_verified = 1 WHERE email_verified = 0;

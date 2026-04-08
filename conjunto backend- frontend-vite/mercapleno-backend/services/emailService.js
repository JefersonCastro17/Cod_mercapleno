const nodemailer = require("nodemailer");

const SMTP_SERVICE = process.env.SMTP_SERVICE;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || SMTP_USER;
const APP_NAME = process.env.APP_NAME || "Mercapleno";

let transporter = null;

const ensureTransporter = () => {
  if (transporter) return transporter;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP not configured: missing SMTP_USER/SMTP_PASS");
  }

  if (!SMTP_FROM_EMAIL) {
    throw new Error("SMTP not configured: missing SMTP_FROM_EMAIL");
  }

  if (!SMTP_SERVICE && !SMTP_HOST) {
    throw new Error("SMTP not configured: missing SMTP_HOST");
  }

  const options = SMTP_SERVICE
    ? {
        service: SMTP_SERVICE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      }
    : {
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      };

  transporter = nodemailer.createTransport(options);
  return transporter;
};

const formatFrom = () => (APP_NAME ? `"${APP_NAME}" <${SMTP_FROM_EMAIL}>` : SMTP_FROM_EMAIL);

const buildVerificationEmail = (code, ttlMinutes) => ({
  subject: `${APP_NAME} - Codigo de verificacion`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Tu codigo de verificacion es:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">${code}</div>
      <p>Este codigo vence en ${ttlMinutes} minutos.</p>
    </div>
  `,
  text: `Tu codigo de verificacion es: ${code}. Este codigo vence en ${ttlMinutes} minutos.`
});

const buildResetEmail = (code, ttlMinutes) => ({
  subject: `${APP_NAME} - Recuperar contrasena`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Tu codigo para recuperar la contrasena es:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">${code}</div>
      <p>Este codigo vence en ${ttlMinutes} minutos.</p>
    </div>
  `,
  text: `Tu codigo para recuperar la contrasena es: ${code}. Este codigo vence en ${ttlMinutes} minutos.`
});

const sendVerificationCode = async (to, code, ttlMinutes) => {
  const smtp = ensureTransporter();
  const payload = buildVerificationEmail(code, ttlMinutes);
  return smtp.sendMail({
    from: formatFrom(),
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  });
};

const sendPasswordResetCode = async (to, code, ttlMinutes) => {
  const smtp = ensureTransporter();
  const payload = buildResetEmail(code, ttlMinutes);
  return smtp.sendMail({
    from: formatFrom(),
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  });
};

module.exports = {
  sendVerificationCode,
  sendPasswordResetCode
};

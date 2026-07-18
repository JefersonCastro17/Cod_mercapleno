/**
 * Utilidad de validación de datos de usuario para el CRUD.
 * Esta lógica imita las validaciones de class-validator utilizadas en el backend de NestJS.
 */
function validateUser(user) {
  const errors = [];

  // Validar nombre
  if (!user.nombre) {
    errors.push('El nombre es obligatorio');
  } else if (typeof user.nombre !== 'string') {
    errors.push('El nombre debe ser un texto');
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(user.nombre)) {
    errors.push('El nombre solo puede contener letras');
  }

  // Validar apellido
  if (!user.apellido) {
    errors.push('El apellido es obligatorio');
  } else if (typeof user.apellido !== 'string') {
    errors.push('El apellido debe ser un texto');
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(user.apellido)) {
    errors.push('El apellido solo puede contener letras');
  }

  // Validar email
  if (!user.email) {
    errors.push('El email es obligatorio');
  } else if (typeof user.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('El correo electrónico no es válido');
  }

  // Validar contraseña
  if (!user.password) {
    errors.push('La contraseña es obligatoria');
  } else if (typeof user.password !== 'string') {
    errors.push('La contraseña debe ser un texto');
  }

  // Validar dirección
  if (!user.direccion) {
    errors.push('La dirección es obligatoria');
  } else if (typeof user.direccion !== 'string') {
    errors.push('La dirección debe ser un texto');
  }

  // Validar fecha de nacimiento (YYYY-MM-DD)
  if (!user.fecha_nacimiento) {
    errors.push('La fecha de nacimiento es obligatoria');
  } else if (
    typeof user.fecha_nacimiento !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(user.fecha_nacimiento)
  ) {
    errors.push('La fecha de nacimiento debe tener el formato YYYY-MM-DD');
  }

  // Validar id_rol
  if (user.id_rol === undefined || user.id_rol === null) {
    errors.push('El rol es obligatorio');
  } else if (!Number.isInteger(user.id_rol)) {
    errors.push('El id del rol debe ser un número entero');
  }

  // Validar id_tipo_identificacion
  if (user.id_tipo_identificacion === undefined || user.id_tipo_identificacion === null) {
    errors.push('El tipo de identificación es obligatorio');
  } else if (!Number.isInteger(user.id_tipo_identificacion)) {
    errors.push('El tipo de identificación debe ser un número entero');
  }

  // Validar numero_identificacion
  if (!user.numero_identificacion) {
    errors.push('El número de identificación es obligatorio');
  } else if (typeof user.numero_identificacion !== 'string') {
    errors.push('El número de identificación debe ser un texto');
  } else if (!/^\d+$/.test(user.numero_identificacion)) {
    errors.push('El número de identificación debe contener solo dígitos');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { validateUser };

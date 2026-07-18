const { validateUser } = require('./users.validation');

describe('Pruebas Unitarias - Validación del CRUD de Usuarios', () => {
  let validUser;

  beforeEach(() => {
    validUser = {
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan.perez@example.com',
      password: 'password123',
      direccion: 'Calle Falsa 123',
      fecha_nacimiento: '1990-05-15',
      id_rol: 1,
      id_tipo_identificacion: 1,
      numero_identificacion: '123456789',
    };
  });

  it('debe pasar la validación con un usuario válido', () => {
    const result = validateUser(validUser);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('debe fallar si faltan campos obligatorios', () => {
    delete validUser.nombre;
    delete validUser.email;

    const result = validateUser(validUser);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El nombre es obligatorio');
    expect(result.errors).toContain('El email es obligatorio');
  });

  it('debe fallar si el nombre contiene números', () => {
    validUser.nombre = 'Juan123';
    const result = validateUser(validUser);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El nombre solo puede contener letras');
  });

  it('debe fallar si el email no es válido', () => {
    validUser.email = 'juan.perez.com';
    const result = validateUser(validUser);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El correo electrónico no es válido');
  });

  it('debe fallar si el formato de la fecha de nacimiento es incorrecto', () => {
    validUser.fecha_nacimiento = '15-05-1990';
    const result = validateUser(validUser);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('La fecha de nacimiento debe tener el formato YYYY-MM-DD');
  });

  it('debe fallar si el número de identificación contiene letras', () => {
    validUser.numero_identificacion = '12345ABC';
    const result = validateUser(validUser);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El número de identificación debe contener solo dígitos');
  });

  it('debe fallar si el id_rol no es un número entero', () => {
    validUser.id_rol = 1.5;
    const result = validateUser(validUser);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El id del rol debe ser un número entero');
  });
});

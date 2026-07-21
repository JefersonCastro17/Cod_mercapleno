const {
    validateRegister,
    validateLogin,
    validateVerifyEmail,
    validateVerifyLoginCode,
} = require('./auth.validation');

describe('Pruebas Unitarias - Módulo de autenticación', () => {
    describe('Validación de registro de usuario', () => {
        let validRegisterData;

        beforeEach(() => {
            validRegisterData = {
                nombre: 'Mario',
                apellido: 'Mendoza',
                email: 'mario.mendoza@example.com',
                password: 'Secreto123456789!',
                dirección: 'Calle 10 # 20-30',
                fecha_nacimiento: '2000-04-12',
                id_tipo_identificación: 1,
                numero_identificación: '1020304050',
            };
        });

        it('debe pasar la validación con un registro completo y válido', () => {
            const result = validateRegister(validRegisterData);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
        });


        it('debe fallar si la contraseña no cumple las reglas de seguridad', () => {
            validRegisterData.password = 'debil';
            const result = validateRegister(validRegisterData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('La contraseña debe tener al menos 12 caracteres');
            expect(result.errors).toContain('La contraseña debe contener al menos una letra mayúscula');
            expect(result.errors).toContain('La contraseña debe contener al menos un número');
            expect(result.errors).toContain('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
        });


        it('debe fallar si faltan campos obligatorios', () => {
            delete validRegisterData.nombre;
            delete validRegisterData.email;
            delete validRegisterData.numero_identificación;
            const result = validateRegister(validRegisterData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('El nombre es obligatorio');
            expect(result.errors).toContain('El correo electrónico no es válido');
            expect(result.errors).toContain('El número de identificación es obligatorio');
        });


        it('debe fallar si el número de identificación contiene letras', () => {
            validRegisterData.numero_identificación = '10203040ABC';
            const result = validateRegister(validRegisterData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('El número de identificación debe contener solo dígitos');
        });
    });



    describe('Validación de inicio de sesión', () => {
        let validLoginData;

        beforeEach(() => {
            validLoginData = {
                email: 'usuario@mercapleno.com',
                password: 'password123',
            };
        });

        it('debe pasar la validación con email y contraseña correctos', () => {
            const result = validateLogin(validLoginData);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
        });


        it('debe fallar si el email es inválido', () => {
            validLoginData.email = 'usuario_sin_arroba.com';
            const result = validateLogin(validLoginData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('El email no es válido');
        });


        it('debe fallar si no se proporciona contraseña', () => {
            delete validLoginData.password;
            const result = validateLogin(validLoginData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('La contraseña es requerida');
        });
    });



    describe('Validación de verificación de correo', () => {
        it('debe pasar con un correo válido y un código de 6 dígitos', () => {
            const result = validateVerifyEmail({
                email: 'usuario@mercapleno.com',
                code: '123456',
            });
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
        });


        it('debe fallar si el código no tiene 6 dígitos', () => {
            const result = validateVerifyEmail({
                email: 'usuario@mercapleno.com',
                code: '123',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('El código de verificación debe ser un texto de 6 dígitos');
        });
    });


    describe('Validación de código 2FA para login', () => {
        it('debe pasar con un pendingToken y un código 2FA de 6 dígitos', () => {
            const result = validateVerifyLoginCode({
                pendingToken: 'token.provisional.jwt',
                code: '654321',
            });
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
        });


        it('debe fallar si falta el pendingToken', () => {
            const result = validateVerifyLoginCode({
                code: '654321',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('El token pendiente es obligatorio');
        });

        
        it('debe fallar si el código 2FA no es numérico de 6 dígitos', () => {
            const result = validateVerifyLoginCode({
                pendingToken: 'token.provisional.jwt',
                code: 'ABCDEF',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('El código de 2FA debe ser un texto de 6 dígitos');
        });
    });
});

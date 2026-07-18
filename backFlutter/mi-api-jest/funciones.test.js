const {suma, resta} = require('./funciones');

describe('Pruebas unitarias de funciones matematicas',() =>{
    test('suma 2+3 debe ser 5', () => {
        expect(suma(2,3)).toBe(5)
    });

    test('resta 5-3 debe ser 2', () => {
        expect(resta(5,3)).toBe(2)
    });
});
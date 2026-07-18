const request = require('supertest');
const app = require('./app');

describe('GET /saludo', () => {
    test('deberia responder con saludo', async() =>{
        const response = await request(app).get('/saludo');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ mensaje: 'Hola Mundo'});
    });
});
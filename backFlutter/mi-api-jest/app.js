const express = require('express');
const app = express();

app.use(express.json());

app.get('/saludo',(req, res) => {
    res.json ({mensaje: 'Hola Mundo'});
});

app.get('/saludo', (req, res) => {
    res.json({ mensaje: 'Hola Mundo'});
});

module.exports = app;

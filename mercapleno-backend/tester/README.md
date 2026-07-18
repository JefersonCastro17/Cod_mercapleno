# Mercapleno API Tester

Este directorio contiene pruebas unitarias y de integración escritas en JavaScript puro (`JS`) utilizando **Jest** y **Supertest** para probar las funcionalidades de autenticación y CRUD de usuarios del backend de Mercapleno.

Al estar en una carpeta independiente, puedes subir todo el contenido de esta carpeta (`tester`) a otro repositorio dedicado únicamente a las pruebas.

## Estructura

- `unit/`: Contiene las pruebas unitarias. Prueban la lógica de validación de datos de usuarios de manera aislada (sin base de datos).
- `integration/`: Contiene las pruebas de integración. Consumen los endpoints reales del backend levantado en `http://localhost:4000/api` e interactúan con la base de datos de desarrollo para obtener y validar los tokens del flujo de inicio de sesión con segundo factor (2FA).

## Requisitos Previos

1. Asegúrate de tener instalado **Node.js**.
2. Asegúrate de que tu base de datos de desarrollo y el backend de Mercapleno estén activos.
   - Si no lo has hecho, puedes sembrar los datos base en el backend con:
     ```bash
     npm run seed:base
     ```
   - E iniciar el backend con:
     ```bash
     npm run start:dev
     ```

## Instalar dependencias

Ejecuta el siguiente comando dentro de esta carpeta para instalar las dependencias necesarias de pruebas (`jest`, `supertest`, `mysql2`, `dotenv`):

```bash
npm install
```

## Ejecutar Pruebas

Para correr todas las pruebas (tanto unitarias como de integración):

```bash
npm test
```

Para correr únicamente las pruebas unitarias:

```bash
npm run test:unit
```

Para correr únicamente las pruebas de integración (asegúrate de que el backend esté corriendo en el puerto configurado en el `.env`):

```bash
npm run test:integration
```

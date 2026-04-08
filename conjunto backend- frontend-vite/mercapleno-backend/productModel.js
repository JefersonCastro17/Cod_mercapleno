//  productModel.js (VERSIÓN FINAL Y 100% CORREGIDA CONTRA ERRORES DE INDENTACIÓN SQL)

const { pool, query } = require('./db');

//  CONSTANTES DE NEGOCIO

const DOCUMENTO_VENTA_ID = 'CC';
const MOVIMIENTO_VENTA_ID = 2;


//  ERROR PERSONALIZADO

class StockInsuficienteError extends Error {
  constructor(id_producto, message = `Stock insuficiente para el producto ID: ${id_producto}`) {
    super(message);
    this.name = 'StockInsuficienteError';
    this.id_producto = id_producto;
  }
}

//  PRODUCTOS

const getFilteredProducts = async ({ search, category, precioMin, precioMax }) => {
  let sql = `
SELECT 
p.id_productos AS id,
p.nombre,
p.descripcion,
p.precio,
c.nombre AS category,
p.imagen AS image,
COALESCE(sa.stock,0) AS stock
FROM productos p
LEFT JOIN stock_actual sa ON p.id_productos = sa.id_productos
LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
WHERE p.estado='Disponible'
AND COALESCE(sa.stock,0)>0
`;

  const params = [];

  if (category && category !== 'todas') {
    sql += ` AND LOWER(c.nombre)=LOWER(?)`;
    params.push(category);
  }

  if (search) {
    sql += ` AND p.nombre LIKE ?`;
    params.push(`%${search}%`);
  }

  if (!isNaN(precioMin)) {
    sql += ` AND p.precio>=?`;
    params.push(precioMin);
  }

  if (!isNaN(precioMax)) {
    sql += ` AND p.precio<=?`;
    params.push(precioMax);
  }

  sql += ` ORDER BY p.nombre ASC`;

  const [rows] = await query(sql, params);

  return rows.map(r => ({
    id: r.id.toString(),
    nombre: r.nombre,
    descripcion: r.descripcion || '',
    price: Number(r.precio),
    category: r.category?.toLowerCase() || 'otros',
    image: r.image,
    stock: r.stock
  }));
};

const getAvailableCategories = async () => {
  const sql = `
SELECT 
c.nombre AS category,
COUNT(p.id_productos) AS product_count
FROM categoria c
JOIN productos p ON c.id_categoria=p.id_categoria
JOIN stock_actual sa ON p.id_productos=sa.id_productos
WHERE sa.stock>0
GROUP BY c.nombre
ORDER BY c.nombre
`;

  const [rows] = await query(sql);

  return rows.map(r => ({
    value: r.category.toLowerCase(),
    label: r.category.charAt(0).toUpperCase() + r.category.slice(1),
    count: r.product_count
  }));
};

// REGISTRO DE VENTA (TRANSACCIONAL)

const registerOrderAndHandleInventory = async (items, total, id_usuario, id_metodo) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction(); //  INICIO DE TRANSACCIÓN

    // 1. INSERT INTO venta: CORREGIDO
    const [ventaResult] = await connection.query(
      `INSERT INTO venta (id_documento,id_usuario,id_metodo,fecha,total)
VALUES (?,?,?,NOW(),?)`, 
      [DOCUMENTO_VENTA_ID, id_usuario, id_metodo, total]
    );

    const id_venta = ventaResult.insertId;

    if (!id_venta) throw new Error("No se generó la venta");

    for (const item of items) {
      const { id: id_producto, cantidad } = item;

      // 2. SELECT... FOR UPDATE: CORREGIDO
      const [[producto]] = await connection.query(
        `SELECT p.precio, sa.stock
FROM productos p
JOIN stock_actual sa ON p.id_productos=sa.id_productos
WHERE p.id_productos=? FOR UPDATE`, 
        [id_producto]
      );

      if (!producto || producto.stock < cantidad) {
        throw new StockInsuficienteError(id_producto);
      }

      // 3. INSERT INTO venta_productos: CORREGIDO
      await connection.query(
        `INSERT INTO venta_productos (id_venta,id_productos,cantidad,precio)
VALUES (?,?,?,?)`, 
        [id_venta, id_producto, cantidad, producto.precio]
      );

      // 4. INSERT INTO salida_productos: CORREGIDO
      await connection.query(
        `INSERT INTO salida_productos
(id_productos,cantidad,fecha,id_documento,id_usuario,id_movimiento)
VALUES (?,?,NOW(),?,?,?)`, 
        [id_producto, cantidad, DOCUMENTO_VENTA_ID, id_usuario, MOVIMIENTO_VENTA_ID]
      );

      // 5. UPDATE stock_actual: CORREGIDO
      await connection.query(
        `UPDATE stock_actual SET stock=stock-?
WHERE id_productos=?`, 
        [cantidad, id_producto]
      );
    }

    await connection.commit(); //  COMMIT: Hace la venta permanente y visible para los reportes
    return { id_venta: id_venta.toString(), total };

  } catch (error) {
    await connection.rollback(); //  ROLLBACK: Deshace si algo falla
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getFilteredProducts,
  getAvailableCategories,
  registerOrderAndHandleInventory,
  StockInsuficienteError
};

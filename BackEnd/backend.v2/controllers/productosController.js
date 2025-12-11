const db = require("../db");

// CREATE
exports.crearProducto = (req, res) => {
    const { nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen } = req.body;

    const sql = `
        INSERT INTO productos 
        (nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al crear producto" });

        res.status(201).json({ message: "Producto creado", id: result.insertId });
    });
};

// READ
exports.obtenerProductos = (req, res) => {
    db.query("SELECT * FROM productos", (err, result) => {
        if (err) return res.status(500).json({ error: "Error al obtener productos" });

        res.status(200).json(result);
    });
};

// UPDATE
exports.actualizarProducto = (req, res) => {
    const id = req.params.id;
    const { nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen } = req.body;

    const sql = `
        UPDATE productos SET 
        nombre=?, precio=?, id_categoria=?, id_proveedor=?, descripcion=?, estado=?, imagen=?
        WHERE id_productos=?
    `;

    db.query(sql, [nombre, precio, id_categoria, id_proveedor, descripcion, estado, imagen, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al actualizar producto" });

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Producto no encontrado" });

        res.status(200).json({ message: "Producto actualizado" });
    });
};

// DELETE
exports.eliminarProducto = (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM productos WHERE id_productos=?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al eliminar producto" });

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Producto no encontrado" });

        res.status(200).json({ message: "Producto eliminado" });
    });
};

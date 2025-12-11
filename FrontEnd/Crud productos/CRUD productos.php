<?php
include("database.php");

$buscar = isset($_POST['txtbuscar']) ? trim($_POST['txtbuscar']) : '';

// Evita inyecciones SQL usando consultas preparadas
if ($buscar !== '') {
    $stmt = $conn->prepare("SELECT * FROM productos WHERE nombre LIKE ?");
    $param = $buscar . '%';
    $stmt->bind_param("s", $param);
    $stmt->execute();
    $resultado = $stmt->get_result();
} else {
    $resultado = $conn->query("SELECT * FROM productos");
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="crud_productos.css">
    <title>CRUD productos</title>
</head>
<body>
 <header>
    <h1><?php echo "Portal 2"; ?></h1>
  </header>
    <div>
        <h2>Registrar Producto</h2>
    </div>

   <table>
    <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Precio</th>
        <th>Categoría</th>
        <th>Proveedor</th>
        <th>Descripción</th>
        <th>Estado</th>
        <th>Imagen</th>
        <th>Acciones</th>
    </tr>
    <?php
    if ($resultado->num_rows > 0) {
        while ($fila = $resultado->fetch_assoc()) {
            echo "<tr>";
            echo "<td>{$fila['id_productos']}</td>";
            echo "<td>{$fila['nombre']}</td>";
            echo "<td>{$fila['precio']}</td>";
            echo "<td>{$fila['id_categoria']}</td>";
            echo "<td>{$fila['id_proveedor']}</td>";
            echo "<td>{$fila['descripcion']}</td>";
            echo "<td>{$fila['estado']}</td>";
            echo "<td><img src='{$fila['imagen']}' width='60'></td>";
            echo "<td>
                    <a href='editarproducto.php?id={$fila['id_productos']}'>Modificar</a> |
                    <a href='eliminarproducto.php?id={$fila['id_productos']}' 
                       onclick=\"return confirm('¿Eliminar {$fila['nombre']}?')\">Eliminar</a>
                  </td>";
            echo "</tr>";
        }
    } else {
        echo "<tr><td colspan='9'>No hay productos registrados</td></tr>";
    }
    ?>
</table>

<footer class= "pie de pagina">
    <p>Derechos reservados &copy; 2025 - Portal 2</p> 
</footer>

</body>
<html>
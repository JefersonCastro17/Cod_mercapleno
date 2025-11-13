<?php
// Conexión a la base de datos
$host = "localhost";
$user = "root";
$pass = "";
$db = "mercapleno";

$conn = new mysqli($host, $user, $pass, $db);

// Validación de conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>

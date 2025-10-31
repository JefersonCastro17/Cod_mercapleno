<?php
// mercapleno_api/register.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__.'/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!$nombre || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'El correo ya está registrado']);
        exit;
    }

    $passHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, apellido, email, password) VALUES (?, ?, ?, ?)");
    $stmt->execute([$nombre, $apellido, $email, $passHash]);

    echo json_encode(['ok' => true, 'message' => 'Registro exitoso']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al registrar']);
}
?>

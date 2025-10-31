<?php
// mercapleno_api/login.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__.'/db.php';
require_once __DIR__.'/jwt_utils.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit;
    }

    // crear token con id y email
    $payload = ['usuario_id' => $user['id'], 'email' => $user['email'], 'nombre' => $user['nombre']];
    $token = crear_jwt($payload, 3600);

    // guardar token en BD
    $stmt = $pdo->prepare("INSERT INTO tokens (usuario_id, token) VALUES (?, ?)");
    $stmt->execute([$user['id'], $token]);

    // establecer cookie HttpOnly (1 hora)
    setcookie('mercapleno_jwt', $token, [
        'expires' => time() + 3600,
        'path' => '/',
        'httponly' => true,
        'secure' => false, // pon true si usas HTTPS
        'samesite' => 'Lax'
    ]);

    // guardar en session opcionalmente
    $_SESSION['mercapleno_jwt'] = $token;

    echo json_encode(['ok' => true, 'message' => 'Login correcto']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en el servidor']);
}
?>

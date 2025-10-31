<?php
// mercapleno_api/verify_token.php
require_once __DIR__.'/db.php';
require_once __DIR__.'/jwt_utils.php';
session_start();

$token = $_COOKIE['mercapleno_jwt'] ?? $_SESSION['mercapleno_jwt'] ?? null;
if (!$token) {
    header('Location: ../public/login.html');
    exit;
}

// verificar firma y expiración
$payload = verificar_jwt($token);
if (!$payload) {
    $stmt = $pdo->prepare("DELETE FROM tokens WHERE token = ?");
    $stmt->execute([$token]);
    setcookie('mercapleno_jwt', '', time() - 3600, '/', '', false, true);
    session_destroy();
    header('Location: ../public/login.html');
    exit;
}

// verificar que exista en la BD (token no eliminado)
$stmt = $pdo->prepare("SELECT id FROM tokens WHERE token = ?");
$stmt->execute([$token]);
if (!$stmt->fetch()) {
    setcookie('mercapleno_jwt', '', time() - 3600, '/', '', false, true);
    session_destroy();
    header('Location: ../public/login.html');
    exit;
}

// token válido — $payload tiene datos del usuario
$current_user = $payload;
?>

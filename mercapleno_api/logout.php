<?php
// mercapleno_api/logout.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__.'/db.php';
session_start();

$token = $_COOKIE['mercapleno_jwt'] ?? $_SESSION['mercapleno_jwt'] ?? null;

if ($token) {
    try {
        $stmt = $pdo->prepare("DELETE FROM tokens WHERE token = ?");
        $stmt->execute([$token]);
    } catch (Exception $e) {
        // ignore DB errors, proceed to clear cookie
    }
}

// eliminar cookie
setcookie('mercapleno_jwt', '', time() - 3600, '/', '', false, true);
unset($_SESSION['mercapleno_jwt']);
session_destroy();

echo json_encode(['ok' => true, 'message' => 'Sesión cerrada']);
?>

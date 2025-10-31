<?php
// mercapleno_api/jwt_utils.php
// CAMBIA ESTA CLAVE POR UNA MUY LARGA EN PRODUCCIÓN
const JWT_SECRET = 'CAMBIA_POR_UNA_CLAVE_MUY_LARGA_Y_SEGURA_2025';

// base64url helpers
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) $data .= str_repeat('=', 4 - $remainder);
    return base64_decode(strtr($data, '-_', '+/'));
}

function crear_jwt($payload_array, $exp_seconds = 3600) {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload = $payload_array;
    $payload['exp'] = time() + $exp_seconds;

    $b64h = base64url_encode(json_encode($header));
    $b64p = base64url_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$b64h.$b64p", JWT_SECRET, true);
    $b64s = base64url_encode($signature);

    return "$b64h.$b64p.$b64s";
}

function verificar_jwt($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;
    [$h, $p, $s] = $parts;
    $check = base64url_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
    if (!hash_equals($check, $s)) return false;
    $payload = json_decode(base64url_decode($p), true);
    if (!isset($payload['exp']) || $payload['exp'] < time()) return false;
    return $payload;
}
?>

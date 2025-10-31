<?php
require_once __DIR__.'/../mercapleno_api/verify_token.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Dashboard - Mercapleno</title>
  <link rel="stylesheet" href="login.css">
</head>
<body>
  <header>
    <div class="header-container">
      <div class="logo-section">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 5L15 10H10V15L5 20L10 25V30H15L20 35L25 30H30V25L35 20L30 15V10H25L20 5Z" fill="white"/>
            <text x="20" y="28" font-family="Arial" font-size="14" fill="#0066CC" text-anchor="middle" font-weight="bold">M</text>
          </svg>
          <span class="logo-text">Mercapleno</span>
        </div>
        <h1 class="portal-title">Portal 2</h1>
      </div>
    </div>
  </header>

  <main>
    <div class="form-container">
      <h2>Bienvenido, <?php echo htmlspecialchars($current_user['nombre'] ?? ''); ?></h2>
      <p>Este es tu panel protegido.</p>
      <a href="../mercapleno_api/logout.php" class="submit-btn" style="display:inline-block;text-align:center;padding:10px 20px;margin-top:20px;">Cerrar sesión</a>
    </div>
  </main>

  <footer></footer>
</body>
</html>

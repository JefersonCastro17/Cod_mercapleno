# Mercapleno Flutter App

Aplicación móvil Flutter para Mercapleno. Esta app se conecta a un backend REST y ofrece:
- Autenticación con sesión persistente.
- Login con posible flujo de dos factores.
- Registro, verificación de correo y recuperación de contraseña.
- Catálogo de productos con filtros y carrito de compras.
- Proceso de venta y checkout desde el móvil.
- Panel administrativo para usuarios con rol de administrador.

## 1. Requisitos
- Flutter SDK compatible con `sdk: ^3.11.5`.
- `flutter pub get` para instalar dependencias.
- Backend disponible y accesible en `API_BASE_URL`.

## 2. Cómo ejecutar
```bash
cd flutter
flutter pub get
flutter run
```

## 3. Variables de entorno
- El proyecto carga `.env` como activo desde `pubspec.yaml`.
- `lib/core/config/app_config.dart` busca `API_BASE_URL` en:
  1. `String.fromEnvironment('API_BASE_URL')`
  2. `.env` con `flutter_dotenv`
  3. fallback: `http://10.146.186.76:4000`

## 4. Arquitectura general
- Punto de entrada: `lib/main.dart`
- Configuración de la app: `lib/app/app.dart`
- Cliente HTTP centralizado: `lib/core/network/api_client.dart`
- Almacenamiento de sesión: `lib/core/storage/session_storage.dart`
- Configuración de endpoints y base URL: `lib/core/config/app_config.dart`
- Módulos agrupados en `lib/features/*`

## 5. Módulos principales
### 5.1 Autenticación
- `lib/features/auth/presentation/controllers/auth_controller.dart`
  - Controla login, registro, 2FA, verificación de email, olvido y reseteo de contraseña.
  - Mantiene estado de sesión, errores, información y vistas activas.
- `lib/features/auth/data/repositories/auth_repository_impl.dart`
  - Interactúa con `AuthRemoteDataSource` y `SessionStorage`.
  - Persiste sesión con token y usuario.

### 5.2 Catálogo y ventas
- `lib/features/venta/presentation/providers/venta_provider.dart`
  - Carga el catálogo de productos.
  - Administra filtros, búsqueda y carrito.
  - Gestiona método de pago y checkout.
- `lib/features/venta/presentation/pages/catalogo_page.dart`
  - Presenta el catálogo en grid.
  - Permite agregar productos al carrito.
  - Incluye botón de filtro y acceso al carrito.

### 5.3 Home y roles
- `lib/features/home/presentation/pages/landing_page.dart`
  - Pantalla inicial de bienvenida.
  - Permite ir a login o registro.
- `lib/features/home/presentation/pages/home_page.dart`
  - Elige la vista según el rol del usuario:
    - rol 1: dashboard de administrador
    - rol 2: dashboard de empleado
    - rol 3: catálogo de cliente

### 5.4 Administración de usuarios
- `lib/features/users_admin/presentation/controllers/users_admin_controller.dart`
  - Carga lista de usuarios, búsqueda, crear, actualizar y eliminar.
- `lib/features/users_admin/presentation/pages/users_admin_list_page.dart`
  - Página para listar y gestionar usuarios.
  - Requiere token activo desde `AuthController`.

## 6. Flujo principal
### 6.1 Inicio de la app
1. `main.dart` carga `.env` y crea `ApiClient`.
2. Se inicializan `AuthController`, `UsersAdminController` y `VentaProvider`.
3. `MyApp` muestra:
   - splash si la sesión se está restaurando.
   - `HomePage` si el usuario está autenticado.
   - `LandingPage` si no hay sesión.

### 6.2 Login / registro
- `LoginPage` interactúa con `AuthController`.
- El login puede requerir 2FA si el backend devuelve `requiresTwoFactor`.
- El registro y verificación de correo se manejan desde el mismo flujo.

### 6.3 Catálogo y carrito
- `CatalogoPage` carga los productos al iniciar.
- Los productos se muestran en tarjetas con imagen, nombre, precio y botón para agregar al carrito.
- `VentaProvider` mantiene el estado del carrito y calcula totales.
- El checkout se realiza con `processCheckout()` en el proveedor.

### 6.4 Dashboard administrativo
- El dashboard de administrador muestra accesos a:
  - gestión de productos
  - gestión de usuarios
  - estadísticas
  - inventario
- Para la administración de usuarios, la app usa token y CRUD contra el backend.

## 7. Estructura de carpetas importante
- `lib/app/` - configuración de la app y rutas.
- `lib/core/` - red, configuración y almacenamiento local.
- `lib/features/auth/` - autenticación y sesión.
- `lib/features/venta/` - catálogo, carrito y ventas.
- `lib/features/home/` - navegación principal según estado de sesión.
- `lib/features/users_admin/` - gestión de usuarios.

## 8. Notas técnicas
- `ApiClient` maneja errores de red, timeouts y formato JSON.
- `SessionStorage` guarda token y usuario en `SharedPreferences`.
- `AppConfig` centraliza rutas del backend y limpieza de URL.
- El backend debe estar disponible en la URL configurada para que la app funcione.

## 9. Comandos útiles
```bash
flutter pub get
flutter run
```
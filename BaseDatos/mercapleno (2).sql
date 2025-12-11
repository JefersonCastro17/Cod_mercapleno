-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-12-2025 a las 17:51:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mercapleno`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` char(4) NOT NULL,
  `nombre` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`) VALUES
('C001', 'Abarrotes'),
('C002', 'Lácteos'),
('C003', 'Cárnicos'),
('C004', 'Bebidas'),
('C005', 'Panadería'),
('C006', 'Frutas y Verduras'),
('C007', 'Aseo'),
('C008', 'Higiene Personal'),
('C009', 'Snacks'),
('C010', 'Congelados');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `devolver_productos`
--

CREATE TABLE `devolver_productos` (
  `id_devolucion` char(5) NOT NULL,
  `id_productos` char(5) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `metodo` varchar(100) DEFAULT NULL,
  `id_tipo_devolucion` char(4) DEFAULT NULL,
  `id_tipo` char(2) DEFAULT NULL,
  `id_documento` char(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrada_productos`
--

CREATE TABLE `entrada_productos` (
  `id_entrada` char(5) NOT NULL,
  `id_productos` char(5) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `costo_unitario` decimal(10,2) DEFAULT NULL,
  `observaciones` varchar(100) DEFAULT NULL,
  `id_movimiento` char(4) DEFAULT NULL,
  `id_documento` char(2) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodo`
--

CREATE TABLE `metodo` (
  `id_metodo` char(2) NOT NULL,
  `metodo_pago` varchar(42) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodo`
--

INSERT INTO `metodo` (`id_metodo`, `metodo_pago`) VALUES
('M1', 'Efectivo'),
('M2', 'Tarjeta crédito'),
('M3', 'Tarjeta débito'),
('M4', 'Transferencia'),
('M5', 'Nequi'),
('M6', 'Daviplata');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento`
--

CREATE TABLE `movimiento` (
  `id_movimiento` char(4) NOT NULL,
  `id_tipo` char(2) DEFAULT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `fecha_generar` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimiento`
--

INSERT INTO `movimiento` (`id_movimiento`, `id_tipo`, `descripcion`, `fecha_generar`) VALUES
('M001', 'E1', 'Ingreso de abarrotes', '2025-10-22'),
('M002', 'S1', 'Venta mostrador', '2025-10-22'),
('M003', 'E1', 'Compra de productos', '2025-10-22'),
('M004', 'S1', 'Venta general', '2025-10-22'),
('M005', 'D1', 'Devolución cliente', '2025-10-22'),
('M006', 'E1', 'COMPRA mercancía', '2025-10-22'),
('M007', 'E1', 'COMPRA mercancía', '2025-10-22'),
('M008', 'S1', 'VENTA', '2025-10-22'),
('M009', 'D1', 'Producto vencido', '2025-10-22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_productos` char(5) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `precio` decimal(12,2) DEFAULT NULL,
  `id_categoria` char(4) DEFAULT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` enum('Disponible','Agotado','En tránsito','Descontinuado') DEFAULT 'Disponible',
  `imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_productos`, `nombre`, `precio`, `id_categoria`, `id_proveedor`, `descripcion`, `estado`, `imagen`) VALUES
('P001', 'Waos', 300.00, 'C001', 1, ' marca de arroz de alta calidad, seleccionada y cultivada para ofrecer granos blancos, sueltos y deliciosos', 'Disponible', 'https://exitocol.vtexassets.com/arquivos/ids/28955925/Arroz-Diana-1000-gr-552155_a.jpg?v=638864002504830000'),
('P002', 'Leche Alquería 1L', 4200.00, 'C002', 2, 'eche de alta calidad, frescura y con respaldo de un sello de calidad que no necesita hervirse y se puede consumir directamente del empaque', 'Disponible', 'https://carulla.vteximg.com.br/arquivos/ids/21758068/Leche-Entera-Cremosa-En-Bolsa-X-11-Litro-64343_a.jpg?v=638877710608300000'),
('P003', 'Carne de Res 500g', 14500.00, 'C003', 3, 'Carne de res 100 % fresca, seleccionada de ganado criado bajo estrictos estándares de calidad. Su textura tierna y jugosa la hace ideal para asados, guisos, parrillas y preparaciones típicas colombianas.', 'Disponible', 'https://res.cloudinary.com/dnvonflxi/image/upload/v1741755504/products/hbcxagibhpdvkaeukp8m.png'),
('P004', 'Coca-Cola 1.5L', 4800.00, 'C004', 4, 'Refrescante y deliciosa, ideal para acompañar tus comidas favoritas.', 'Disponible', 'https://product-images.farmatodo.com/8lPAboC9AiIl3ApU3iby9wX-oQ_mQy18Ac3AfVJTYU2DVvgdK1orI42eXPjwVVNlqgTt5n_m7XC2ZH_DvhRaS3gw4NmX3QIBsaJMry1Zunl4JRcJWg=s300-rw'),
('P005', 'Pan Bimbo Grande', 4600.00, 'C005', 5, 'Pan tajado blanco suave y fresco Ideal para desayunos, merienda y sándwiches.', 'Disponible', 'https://exitocol.vteximg.com.br/arquivos/ids/25464114/Pan-tajado-Actidefensis-BIMBO-600-gr-3107868_a.jpg?v=638666269317300000'),
('P006', 'Manzana Roja Kg', 5200.00, 'C006', 6, 'Fruta natural fresca, dulce y crujiente ideal para consumir sola, jugos, ensaladas o postres.', 'Disponible', 'https://elsuper.com.co/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTgxNjgzNSwicHVyIjoiYmxvYl9pZCJ9fQ==--1301d4075fe0b768fd11e00f7949f1a32e8479ab/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fZml0IjpbODAwLDgwMF19LCJwdX'),
('P007', 'Detergente Ariel 1Kg', 12800.00, 'C007', 7, 'Limpieza profunda y cuidado de la ropa Remueve manchas difíciles desde el primer lavado.', 'Disponible', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLZ4LOTXQeXPlDdN_lEjlpa2iVSJi6mvRWpw&s'),
('P008', 'Shampoo Savital 350ml', 8700.00, 'C008', 8, 'Cuidado natural para tu cabello Enriquecido con sábila y extractos naturales que nutren, fortalecen y dejan el cabello suave y brillante.', 'Disponible', 'https://http2.mlstatic.com/D_NQ_NP_884079-MLU76991314497_062024-O.webp'),
('P009', 'Papas Margarita 160g', 3200.00, 'C009', 9, 'Papas crocantes con sabor auténtico Elaboradas con papas 100 % naturales, fritas y sazonadas para ofrecer un sabor clásico y delicioso.', 'Disponible', 'https://mecato.shop/cdn/shop/products/papas-margarita-1.jpg?v=1643909363'),
('P010', 'Helado Crem Helado 1L', 10500.00, 'C010', 10, 'Postre cremoso y refrescante Elaborado con ingredientes de alta calidad y sabores irresistibles como vainilla, chocolate, fresa y arequipe.', 'Disponible', 'https://cdn1.totalcommerce.cloud/cremhelado/product-zoom/es/vaso-1-litro-vainilla-1.webp');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`id_proveedor`, `nombre`, `apellido`, `telefono`) VALUES
(1, 'Luis', 'González', '3104567890'),
(2, 'María', 'Rojas', '3112345678'),
(3, 'Pedro', 'Martínez', '3129876543'),
(4, 'Ana', 'Pérez', '3136789123'),
(5, 'Carlos', 'Ruiz', '3143456789'),
(6, 'Jorge', 'Moreno', '3157894321'),
(7, 'Tatiana', 'Vega', '3165678912'),
(8, 'Camilo', 'Ramírez', '3179876123'),
(9, 'Paola', 'Jiménez', '3182345678'),
(10, 'Andrés', 'Castro', '3198765432');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'Administrador'),
(2, 'Empleado'),
(3, 'Cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salida_productos`
--

CREATE TABLE `salida_productos` (
  `id_salida` char(5) NOT NULL,
  `id_productos` char(5) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_documento` char(2) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_movimiento` char(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stock_actual`
--

CREATE TABLE `stock_actual` (
  `id_inventario` char(5) NOT NULL,
  `id_productos` char(5) DEFAULT NULL,
  `id_movimiento` char(4) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `stock_actual`
--

INSERT INTO `stock_actual` (`id_inventario`, `id_productos`, `id_movimiento`, `stock`, `fecha_vencimiento`) VALUES
('ST01', 'P001', 'M001', 150, '2025-04-15'),
('ST02', 'P002', 'M001', 110, '2025-05-10'),
('ST03', 'P003', 'M002', 60, '2025-06-05'),
('ST04', 'P004', 'M002', 90, '2025-07-20'),
('ST05', 'P005', 'M001', 75, '2025-08-10'),
('ST06', 'P006', 'M002', 70, '2025-09-12'),
('ST07', 'P007', 'M005', 30, '2025-03-25'),
('ST08', 'P008', 'M001', 85, '2025-02-28'),
('ST09', 'P009', 'M002', 95, '2025-01-18'),
('ST10', 'P010', 'M005', 48, '2024-12-22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_identificacion`
--

CREATE TABLE `tipos_identificacion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipos_identificacion`
--

INSERT INTO `tipos_identificacion` (`id`, `nombre`) VALUES
(1, 'Cédula de ciudadanía'),
(2, 'Tarjeta de identidad'),
(3, 'Cédula de extranjería');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_devolucion`
--

CREATE TABLE `tipo_devolucion` (
  `id_tipo_devolucion` char(4) NOT NULL,
  `nombre_tipo` varchar(30) DEFAULT NULL,
  `descripcion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_movimiento`
--

CREATE TABLE `tipo_movimiento` (
  `id_tipo` char(2) NOT NULL,
  `nombre_movimiento` varchar(20) DEFAULT NULL,
  `fecha_generar` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_movimiento`
--

INSERT INTO `tipo_movimiento` (`id_tipo`, `nombre_movimiento`, `fecha_generar`) VALUES
('D1', 'Devolución', '2025-10-22'),
('E1', 'Entrada', '2025-10-22'),
('S1', 'Salida', '2025-10-22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_rol` int(11) NOT NULL,
  `id_tipo_identificacion` int(11) NOT NULL,
  `numero_identificacion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `direccion`, `fecha_nacimiento`, `fecha_registro`, `id_rol`, `id_tipo_identificacion`, `numero_identificacion`) VALUES
(0, 'juan', 'perez', 'juanper@gmail.com', '$2b$10$eIQ.9EIECA7XFvEeyzBjTuU5LN6ZIXWx4OAIW3gDeyYpanqyIBNKW', 'calle villa juan del toro', '2006-06-07', '2025-12-10 02:07:52', 2, 1, '12334343'),
(1, 'jeferson', 'bernal', 'jeferson@gmail.com', '$2b$10$1oZGfjj2ew6bqHGr1baZsuLBI7lgrCEDR3a1FeJgZfMCgclbO7R/y', 'calle villa juan del toro', '2005-07-17', '2025-12-10 02:05:50', 1, 1, '1234546678');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id_venta` char(4) NOT NULL,
  `fecha` date DEFAULT NULL,
  `id_documento` char(2) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `total` decimal(12,2) DEFAULT NULL,
  `id_metodo` char(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`id_venta`, `fecha`, `id_documento`, `id_usuario`, `total`, `id_metodo`) VALUES
('V001', '2025-10-22', 'CC', 11, 14500.00, 'M1'),
('V002', '2025-10-22', 'CC', 12, 8800.00, 'M2'),
('V003', '2025-10-22', 'CC', 13, 20500.00, 'M3'),
('V004', '2025-10-22', 'CC', 14, 45000.00, 'M5'),
('V005', '2025-10-22', 'CC', 15, 12800.00, 'M1'),
('V006', '2025-10-22', 'CC', 16, 9500.00, 'M6'),
('V007', '2025-10-22', 'CC', 17, 17300.00, 'M4'),
('V008', '2025-10-22', 'CC', 18, 21000.00, 'M2'),
('V009', '2025-10-22', 'CC', 19, 15200.00, 'M3'),
('V010', '2025-10-22', 'CC', 20, 11800.00, 'M1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta_productos`
--

CREATE TABLE `venta_productos` (
  `id_venta` char(4) NOT NULL,
  `id_productos` char(5) NOT NULL,
  `cantidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `venta_productos`
--

INSERT INTO `venta_productos` (`id_venta`, `id_productos`, `cantidad`) VALUES
('V001', 'P001', 2),
('V001', 'P004', 1),
('V002', 'P009', 5),
('V003', 'P003', 1),
('V004', 'P007', 8),
('V005', 'P005', 1),
('V006', 'P006', 10),
('V007', 'P010', 4),
('V008', 'P002', 1),
('V009', 'P008', 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `devolver_productos`
--
ALTER TABLE `devolver_productos`
  ADD PRIMARY KEY (`id_devolucion`),
  ADD KEY `idx_productos` (`id_productos`),
  ADD KEY `idx_tipo_devolucion` (`id_tipo_devolucion`),
  ADD KEY `idx_tipo` (`id_tipo`),
  ADD KEY `idx_documento` (`id_documento`);

--
-- Indices de la tabla `entrada_productos`
--
ALTER TABLE `entrada_productos`
  ADD PRIMARY KEY (`id_entrada`),
  ADD KEY `id_productos` (`id_productos`),
  ADD KEY `id_movimiento` (`id_movimiento`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `metodo`
--
ALTER TABLE `metodo`
  ADD PRIMARY KEY (`id_metodo`);

--
-- Indices de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `id_tipo` (`id_tipo`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_productos`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_proveedor` (`id_proveedor`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id_proveedor`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `salida_productos`
--
ALTER TABLE `salida_productos`
  ADD PRIMARY KEY (`id_salida`),
  ADD KEY `id_productos` (`id_productos`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_movimiento` (`id_movimiento`);

--
-- Indices de la tabla `stock_actual`
--
ALTER TABLE `stock_actual`
  ADD PRIMARY KEY (`id_inventario`),
  ADD KEY `id_productos` (`id_productos`),
  ADD KEY `id_movimiento` (`id_movimiento`);

--
-- Indices de la tabla `tipos_identificacion`
--
ALTER TABLE `tipos_identificacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipo_devolucion`
--
ALTER TABLE `tipo_devolucion`
  ADD PRIMARY KEY (`id_tipo_devolucion`);

--
-- Indices de la tabla `tipo_movimiento`
--
ALTER TABLE `tipo_movimiento`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_rol` (`id_rol`),
  ADD KEY `id_tipo_identificacion` (`id_tipo_identificacion`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_metodo` (`id_metodo`);

--
-- Indices de la tabla `venta_productos`
--
ALTER TABLE `venta_productos`
  ADD PRIMARY KEY (`id_venta`,`id_productos`),
  ADD KEY `id_productos` (`id_productos`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `devolver_productos`
--
ALTER TABLE `devolver_productos`
  ADD CONSTRAINT `fk_dev_movimiento` FOREIGN KEY (`id_documento`) REFERENCES `movimiento` (`id_movimiento`),
  ADD CONSTRAINT `fk_dev_prod` FOREIGN KEY (`id_productos`) REFERENCES `productos` (`id_productos`),
  ADD CONSTRAINT `fk_dev_tipo_devolucion` FOREIGN KEY (`id_tipo_devolucion`) REFERENCES `tipo_devolucion` (`id_tipo_devolucion`),
  ADD CONSTRAINT `fk_dev_tipo_movimiento` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_movimiento` (`id_tipo`);

--
-- Filtros para la tabla `entrada_productos`
--
ALTER TABLE `entrada_productos`
  ADD CONSTRAINT `entrada_productos_ibfk_1` FOREIGN KEY (`id_productos`) REFERENCES `productos` (`id_productos`),
  ADD CONSTRAINT `entrada_productos_ibfk_2` FOREIGN KEY (`id_movimiento`) REFERENCES `movimiento` (`id_movimiento`),
  ADD CONSTRAINT `entrada_productos_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `movimiento`
--
ALTER TABLE `movimiento`
  ADD CONSTRAINT `movimiento_ibfk_1` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_movimiento` (`id_tipo`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`);

--
-- Filtros para la tabla `salida_productos`
--
ALTER TABLE `salida_productos`
  ADD CONSTRAINT `salida_productos_ibfk_1` FOREIGN KEY (`id_productos`) REFERENCES `productos` (`id_productos`),
  ADD CONSTRAINT `salida_productos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `salida_productos_ibfk_3` FOREIGN KEY (`id_movimiento`) REFERENCES `movimiento` (`id_movimiento`);

--
-- Filtros para la tabla `stock_actual`
--
ALTER TABLE `stock_actual`
  ADD CONSTRAINT `stock_actual_ibfk_1` FOREIGN KEY (`id_productos`) REFERENCES `productos` (`id_productos`),
  ADD CONSTRAINT `stock_actual_ibfk_2` FOREIGN KEY (`id_movimiento`) REFERENCES `movimiento` (`id_movimiento`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_tipo_identificacion`) REFERENCES `tipos_identificacion` (`id`);

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`id_metodo`) REFERENCES `metodo` (`id_metodo`);

--
-- Filtros para la tabla `venta_productos`
--
ALTER TABLE `venta_productos`
  ADD CONSTRAINT `venta_productos_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`),
  ADD CONSTRAINT `venta_productos_ibfk_2` FOREIGN KEY (`id_productos`) REFERENCES `productos` (`id_productos`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-12-2025 a las 01:52:15
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
-- Base de datos: `prueba`
--

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
(1, 'Jeferson', 'Bernal', 'jeferson@gmail.com', '$2b$10$tGFjRPd.D4Adc/OkL6kwJuy.hkS5Lo2UkxshjCeXKmJ6G119l8.o6', 'Cra 80i #42a 47 Sur', '2006-04-17', '2025-12-04 23:11:45', 1, 1, '1022347723'),
(2, 'julian', 'ladino', 'ladino@gmail.com', '$2b$10$ahdKzJn0vnwc8ZOP6Nhw4usZTI5KJ7emKdxESAS6H2F5bWiuH8lYy', '123', '2006-12-07', '2025-12-04 23:12:48', 2, 1, '10000000'),
(3, 'Jeferson', 'Bernal', 'laura@gmail.com', '$2b$10$Ux3gJW15rGWfitRx4LiSt.5SwpHVPUWYxAr1oWHocYEZlQPdg96ni', 'Cra 80i #42a 47 Sur', '2001-01-10', '2025-12-04 23:21:35', 3, 1, '1000000'),
(4, 'Jeferson', 'Bernal', 'juan@mercapleno.com', '$2b$10$NETHDlaNUBKe2VpqjJlraeKT0NSOyHNtLlPQoIgfVAWb55cFFJF8m', 'Cra 80i #42a 47 Sur', '2000-02-01', '2025-12-04 23:25:16', 3, 1, '71717171'),
(5, 'Jeferson', 'Bernal', 'lolita@gmail.com', '$2b$10$MZ7JBIZEUFk25JJD7Nkzz.gflzIRBm7yNaQfVdI9hNpm.Qpcu4hJ6', 'Cra 80i #42a 47 Sur', '2000-02-05', '2025-12-04 23:33:17', 3, 1, '1233313');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipos_identificacion`
--
ALTER TABLE `tipos_identificacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `numero_identificacion` (`numero_identificacion`),
  ADD KEY `id_rol` (`id_rol`),
  ADD KEY `id_tipo_identificacion` (`id_tipo_identificacion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipos_identificacion`
--
ALTER TABLE `tipos_identificacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_tipo_identificacion`) REFERENCES `tipos_identificacion` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

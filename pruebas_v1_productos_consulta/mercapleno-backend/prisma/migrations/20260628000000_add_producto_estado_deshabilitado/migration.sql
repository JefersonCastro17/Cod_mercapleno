-- Alter enum type for productos.estado to include Deshabilitado
ALTER TABLE `productos`
  MODIFY COLUMN `estado` ENUM('Disponible', 'Agotado', 'En tránsito', 'Descontinuado', 'Deshabilitado') DEFAULT 'Disponible';

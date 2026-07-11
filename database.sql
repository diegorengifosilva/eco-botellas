-- ============================================================
-- SCRIPT DE BASE DE DATOS PARA "ECOBOTELLAS RECICLAJE" (MYSQL)
-- ============================================================

-- Crear base de datos (puedes omitir esta línea si usas un hosting con base de datos ya creada)
CREATE DATABASE IF NOT EXISTS `ecobotellas_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecobotellas_db`;

-- ------------------------------------------------------------
-- Tabla: Alumnos (reciclaje_api_alumno)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reciclaje_api_alumno` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `password` VARCHAR(128) NOT NULL,
  `last_login` DATETIME(6) NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `familia` VARCHAR(150) NOT NULL,
  `salon` VARCHAR(50) NOT NULL,
  `usuario` VARCHAR(50) NOT NULL UNIQUE,
  `fecha_registro` DATETIME(6) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla: Historial de Botellas (reciclaje_api_registrobotellas)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reciclaje_api_registrobotellas` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `cantidad` INT NOT NULL,
  `fecha_hora` DATETIME(6) NOT NULL,
  `alumno_id` INT NOT NULL,
  CONSTRAINT `fk_registro_alumno` FOREIGN KEY (`alumno_id`) 
    REFERENCES `reciclaje_api_alumno` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Índices para optimizar rankings
-- ------------------------------------------------------------
CREATE INDEX `idx_alumno_salon` ON `reciclaje_api_alumno` (`salon`);
CREATE INDEX `idx_alumno_familia` ON `reciclaje_api_alumno` (`familia`);
CREATE INDEX `idx_botellas_fecha` ON `reciclaje_api_registrobotellas` (`fecha_hora`);
CREATE INDEX `idx_botellas_alumno` ON `reciclaje_api_registrobotellas` (`alumno_id`);

-- ------------------------------------------------------------
-- Datos Iniciales de Prueba (Semilla)
-- ------------------------------------------------------------

-- Contraseña encriptada para 'prueba123' (PBKDF2 de Django):
-- 'pbkdf2_sha256$720000$p4v2gG5qDmqL447F9dYm3Z$hHwS40d9/n19s0a2...'
-- Agregamos algunos alumnos iniciales de prueba (Las contraseñas se guardan seguras).
-- Para facilidad, puedes registrar nuevos alumnos desde la pantalla de Registro de la web.
INSERT INTO `reciclaje_api_alumno` 
  (`id`, `password`, `last_login`, `nombre`, `familia`, `salon`, `usuario`, `fecha_registro`, `is_active`, `is_admin`) 
VALUES 
  (1, 'pbkdf2_sha256$720000$rS0Wv7gWJmOp$U5gD5y9yYn/n2b2/u2T0s0a2L0p3a2l8h8q8o8z8l8=', NULL, 'DIEGO 2', 'prueba', '4 anos', 'diego2', NOW(), 1, 0),
  (2, 'pbkdf2_sha256$720000$rS0Wv7gWJmOp$U5gD5y9yYn/n2b2/u2T0s0a2L0p3a2l8h8q8o8z8l8=', NULL, 'Ronaldo', 'Alvarado', '5 anos', 'ronaldo', NOW(), 1, 0),
  (3, 'pbkdf2_sha256$720000$rS0Wv7gWJmOp$U5gD5y9yYn/n2b2/u2T0s0a2L0p3a2l8h8q8o8z8l8=', NULL, 'Diego', 'Gonzales', '3 anos', 'diego', NOW(), 1, 0);

-- Insertar algunos registros de botellas de prueba
INSERT INTO `reciclaje_api_registrobotellas` 
  (`id`, `cantidad`, `fecha_hora`, `alumno_id`) 
VALUES 
  (1, 6, NOW(), 1), -- DIEGO 2: 6 botellas hoy
  (2, 5, NOW(), 2), -- Ronaldo: 5 botellas hoy
  (3, 2, NOW(), 3); -- Diego: 2 botellas hoy

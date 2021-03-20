-- --------------------------------------------------------
-- Host:                         192.168.15.12
-- Server version:               10.3.25-MariaDB-0ubuntu0.20.04.1 - Ubuntu 20.04
-- Server OS:                    debian-linux-gnueabihf
-- HeidiSQL Version:             11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table entities.credentials
CREATE TABLE IF NOT EXISTS `credentials` (
  `token` varchar(50) NOT NULL,
  `expirationDate` datetime NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.credentials: ~76 rows (approximately)
/*!40000 ALTER TABLE `credentials` DISABLE KEYS */;
INSERT INTO `credentials` (`token`, `expirationDate`, `user_id`) VALUES
	('d095284d-7f1a-4bca-a073-eae0a4b43619', '2021-03-17 07:48:44', 5),
	('67ded0f3-8f44-41e1-b4cb-c991c3854894', '2021-03-17 07:50:48', 3),
	('65ffb6ff-f495-44ca-be6b-29f3b7e7c013', '2021-03-17 07:51:19', 6),
	('8b837b2c-9c9e-434e-9fe3-6b26efcd79e9', '2021-03-17 07:51:30', 7),
	('8f5164be-e3cd-4bd2-b4ba-c4725472da88', '2021-03-17 07:51:47', 8),
	('a7068e6d-21c1-4dc9-848b-c6b74bb85600', '2021-03-17 07:52:07', 1),
	('524969f9-de0d-410c-9cd1-c4c975c0dd2c', '2021-03-17 07:54:02', 3),
	('52fd5ea3-6f35-46aa-b25e-d129e012e429', '2021-03-17 07:56:17', 1),
	('4af7f46d-739d-4802-99d8-0eba84e95435', '2021-03-17 08:01:00', 3),
	('44168ecf-def3-477e-88f3-869058eb2251', '2021-03-17 08:01:31', 5),
	('c38edc55-a1ba-4fd8-9628-505b788cd72d', '2021-03-17 08:02:06', 6),
	('cf8de209-f857-4251-b3f0-71d34f1c7a95', '2021-03-17 08:02:19', 7),
	('550a212c-af91-4543-a87f-c24fa9e71a1c', '2021-03-17 08:02:38', 8),
	('68172f52-570e-4a24-adbd-15d15517c72d', '2021-03-17 08:03:43', 7),
	('d6a8d618-bdf0-4d09-8c15-397a90bd866b', '2021-03-17 08:04:43', 6),
	('2e53342a-717e-46e4-94bd-85bc09ee0741', '2021-03-17 08:05:34', 5),
	('6b1617d2-f9bd-43ea-b013-5610b30c947a', '2021-03-17 08:06:38', 3),
	('a1f9b485-d8ce-4db3-8a5d-c0ab63748991', '2021-03-17 08:07:33', 1),
	('736a6f5c-3681-4446-9a9a-4666e89e8973', '2021-03-17 08:13:30', 1),
	('92023add-60cc-4ea9-b041-d6ef63278f01', '2021-03-17 08:14:15', 3),
	('98776ce5-e15d-4584-b8ba-b47c090159ac', '2021-03-17 08:26:12', 1),
	('97a5d1dc-4b00-4059-9ce2-0aa9d2ba6812', '2021-03-17 09:38:39', 3),
	('e036c039-8cfb-46d5-9f5b-b5feb6b9ac4c', '2021-03-17 09:38:47', 1),
	('7acb04e8-e477-4f2c-86d5-7dc05047de92', '2021-03-17 09:39:59', 3),
	('9bbedfa0-d8b6-46a1-9d1e-4cfb8efd9a73', '2021-03-17 14:26:15', 3),
	('4e32fa6f-d0ee-4c1c-aa6d-9373e3fdf029', '2021-03-17 14:26:27', 5),
	('92389fdb-a6ce-4a01-bee0-8779007dd0c9', '2021-03-17 14:26:44', 1),
	('79b4f8f0-5cbb-429c-9c79-328613494832', '2021-03-17 16:33:00', 1),
	('62fe373c-5235-4437-b347-6d7f57fbc66c', '2021-03-17 17:02:33', 1),
	('e04855ad-6321-4eb5-a03b-a8f3a7e56c72', '2021-03-17 17:10:47', 9),
	('229e26e4-891c-4a57-a5a8-a619be7a69e1', '2021-03-17 17:11:03', 10),
	('2008d31e-65b5-4664-a623-ca41a9095efc', '2021-03-17 17:11:15', 1),
	('f30c7f87-6774-4762-a3f0-adff17b147e1', '2021-03-17 17:12:20', 10),
	('de7bdc70-072a-4875-bbe0-b4057ef03983', '2021-03-17 17:12:36', 9),
	('5a3dd1a3-8c2e-4c0c-bc5c-b466c51f96ab', '2021-03-17 17:14:34', 9),
	('01c2d8dc-e7bb-41af-8efe-15a00770063f', '2021-03-17 17:15:24', 10),
	('bd34dfb4-81de-45bd-9043-60c1773b45a1', '2021-03-17 17:16:12', 1),
	('63f402e3-7b07-474d-824b-357cf3b1c69a', '2021-03-17 17:16:16', 1),
	('bb3b97d0-278b-4158-97da-40e3c1070f0c', '2021-03-17 17:17:34', 1),
	('1c37ce2e-850b-49ee-ba8e-12a05172d515', '2021-03-17 17:18:58', 1),
	('17fa530c-4397-4056-8566-27402f257298', '2021-03-17 17:19:01', 1),
	('7e2de45a-f722-436b-94f7-e233843de673', '2021-03-17 17:23:02', 7),
	('3c3184b0-fdc8-4e94-9f97-72a3938f8780', '2021-03-17 17:23:44', 1),
	('ee135df4-5606-4c22-aacc-8da5c555fdd0', '2021-03-17 17:49:44', 3),
	('7dd05681-6b7d-4839-bcab-ce71967b5da6', '2021-03-17 17:49:54', 1),
	('eb8c4a6c-db9f-4b19-961d-3856de697841', '2021-03-17 18:20:03', 7),
	('9502a1e3-3f9a-487f-bd4a-cc3756733a46', '2021-03-17 18:20:15', 8),
	('d80a9bc7-d2b2-4655-bd5d-6dc7a77ee9e2', '2021-03-17 18:20:27', 5),
	('61ac7a48-1616-4429-a329-b52e7bba5da9', '2021-03-17 18:21:16', 3),
	('18eb707b-82f5-481a-8e79-9b84ad5af7c0', '2021-03-17 18:21:58', 1),
	('ea044b50-5fcb-425f-ba04-b417eb1e044d', '2021-03-17 18:28:52', 6),
	('8652118d-8464-4c42-88b5-ef73d1c509b6', '2021-03-17 18:28:54', 6),
	('bdfd0a98-0b57-4edd-8ac7-245a0f689010', '2021-03-17 18:29:11', 9),
	('542b932a-9dca-4234-8ac4-79c6a9ae2b3c', '2021-03-17 18:29:27', 10),
	('51aea72f-0d96-46b5-9a6d-2ba3d02de579', '2021-03-17 19:24:05', 8),
	('0c8971e6-94f2-4387-90e8-5270cc1bc238', '2021-03-17 19:24:17', 7),
	('b16861d2-866a-4168-87bc-47006e6cbea1', '2021-03-17 19:24:37', 10),
	('4ed6dedd-96df-42fe-a274-bc2d7e58da3c', '2021-03-17 19:25:37', 9),
	('4bfde810-8946-46fa-aab2-b7d62c16b80f', '2021-03-17 19:31:13', 10),
	('fb69c70b-0159-486c-b3d6-d05d992c4f46', '2021-03-17 21:08:54', 6),
	('4ba5006e-0065-4f7b-baa0-341de2d280d9', '2021-03-17 21:08:56', 3),
	('3d8a33fb-efaf-48e6-a418-66d6eff9920c', '2021-03-17 21:08:57', 5),
	('51d7108b-6095-479b-96ce-1cfb9a59262e', '2021-03-17 21:09:51', 1),
	('678dd06d-9a17-4c57-b111-55d265818d18', '2021-03-17 21:19:16', 10),
	('7680ea3c-244b-4f4a-af3b-4cc1a475b3e8', '2021-03-18 08:59:11', 1),
	('126b9fff-5ecd-46eb-9435-97ad148d85f0', '2021-03-18 12:28:11', 2),
	('d9822ed4-1df8-46c5-af2d-44a471418454', '2021-03-18 12:28:49', 3),
	('25ee935f-08e6-418a-8446-16f3f64d2b44', '2021-03-18 12:29:45', 5),
	('ff2b3f53-c2ce-43df-93a0-4598844e3dcd', '2021-03-18 12:30:24', 1),
	('c843c26a-256b-4e1f-9792-61493e3644af', '2021-03-18 12:42:53', 1),
	('a65a1f8a-d413-43a4-9852-24458977e2ea', '2021-03-18 18:15:34', 1),
	('fb229f6c-63aa-488a-94b5-e72ebac7ee1e', '2021-03-18 19:08:28', 1),
	('67ac0b74-749e-4253-8b3f-b645bbe608d1', '2021-03-18 19:18:18', 1),
	('38a7a8de-bb5b-4c54-87bb-5711f0e100cd', '2021-03-19 15:19:46', 1),
	('8c335b5c-1c2b-4953-b5cc-e264093ecd55', '2021-03-19 16:57:59', 1),
	('beda57eb-8962-4a14-9d8c-670d00ba91b1', '2021-03-19 17:02:29', 1);
/*!40000 ALTER TABLE `credentials` ENABLE KEYS */;

-- Dumping structure for table entities.estudiante
CREATE TABLE IF NOT EXISTS `estudiante` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidoPaterno` varchar(50) NOT NULL,
  `apellidoMaterno` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.estudiante: ~5 rows (approximately)
/*!40000 ALTER TABLE `estudiante` DISABLE KEYS */;
INSERT INTO `estudiante` (`id`, `nombre`, `apellidoPaterno`, `apellidoMaterno`, `email`) VALUES
	(1, 'Renata', 'Alemán', 'Moreno', 'rfmh24hr@gmail.com'),
	(2, 'Petra', 'Cornejo', 'Mondragon', ''),
	(46, 'Maria', 'Jimenez', 'Gomez', ''),
	(47, 'Rosario', 'Castellanos', 'Castilla', 'rfmh1972@gmail.com'),
	(48, 'blanquita', 'Moreno', 'Padron', '');
/*!40000 ALTER TABLE `estudiante` ENABLE KEYS */;

-- Dumping structure for table entities.exam_impro_ap
CREATE TABLE IF NOT EXISTS `exam_impro_ap` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `completado` tinyint(1) DEFAULT NULL,
  `fechaApplicacion` date DEFAULT NULL,
  `estudiante_id` int(11) NOT NULL,
  `exam_impro_type_id` int(11) NOT NULL,
  `materia` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `estudiante_id` (`estudiante_id`),
  KEY `exam_impro_type_id` (`exam_impro_type_id`),
  CONSTRAINT `exam_impro_ap_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiante` (`id`),
  CONSTRAINT `exam_impro_ap_ibfk_2` FOREIGN KEY (`exam_impro_type_id`) REFERENCES `exam_impro_type` (`id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`completado` in (0,1))
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_impro_ap: ~13 rows (approximately)
/*!40000 ALTER TABLE `exam_impro_ap` DISABLE KEYS */;
INSERT INTO `exam_impro_ap` (`id`, `completado`, `fechaApplicacion`, `estudiante_id`, `exam_impro_type_id`, `materia`) VALUES
	(98, 0, '2021-03-19', 2, 2, 'TU CUERPO'),
	(105, 0, '2021-03-16', 1, 16, 'para blanca'),
	(107, 0, '2021-03-16', 2, 16, 'test2'),
	(108, 0, '2021-03-16', 46, 2, 'VELO'),
	(109, 0, '2021-03-16', 46, 2, 'VELO'),
	(110, 0, '2021-03-16', 46, 3, 'ESPADA'),
	(111, 0, '2021-03-16', 46, 3, 'ESPADA'),
	(112, 0, '2021-03-16', 46, 3, 'SHAMADAN'),
	(113, 0, '2021-03-16', 46, 9, 'velo'),
	(114, 0, '2021-03-16', 46, 3, 'espada'),
	(115, 0, '2021-03-16', 46, 3, 'shamadan'),
	(128, 0, '2021-03-17', 2, 16, 'cocoa'),
	(129, 0, '2021-03-17', 1, 16, 'probando porcentajes');
/*!40000 ALTER TABLE `exam_impro_ap` ENABLE KEYS */;

-- Dumping structure for view entities.exam_impro_ap_calificacion
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `exam_impro_ap_calificacion` (
	`ei_aplication_id` INT(11) NOT NULL,
	`fecha` DATE NULL,
	`materia` VARCHAR(200) NULL COLLATE 'utf8mb4_general_ci',
	`tipo` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`estudiante` VARCHAR(152) NULL COLLATE 'utf8mb4_general_ci',
	`grade` DECIMAL(61,5) NULL
) ENGINE=MyISAM;

-- Dumping structure for table entities.exam_impro_ap_criteria
CREATE TABLE IF NOT EXISTS `exam_impro_ap_criteria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_impro_ap_parameter_id` int(11) NOT NULL,
  `exam_impro_criteria_id` int(11) NOT NULL,
  `selected` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ap_parameter_criteria` (`exam_impro_ap_parameter_id`,`exam_impro_criteria_id`) USING BTREE,
  KEY `FK_exam_impro_ap_criteria_exam_impro_criteria` (`exam_impro_criteria_id`) USING BTREE,
  CONSTRAINT `FK_exam_impro_ap_criteria_exam_impro_ap_parameter` FOREIGN KEY (`exam_impro_ap_parameter_id`) REFERENCES `exam_impro_ap_parameter` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_exam_impro_ap_criteria_exam_impro_criteria` FOREIGN KEY (`exam_impro_criteria_id`) REFERENCES `exam_impro_criteria` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=855 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_impro_ap_criteria: ~58 rows (approximately)
/*!40000 ALTER TABLE `exam_impro_ap_criteria` DISABLE KEYS */;
INSERT INTO `exam_impro_ap_criteria` (`id`, `exam_impro_ap_parameter_id`, `exam_impro_criteria_id`, `selected`) VALUES
	(697, 285, 117, 1),
	(698, 285, 118, 1),
	(699, 285, 119, 1),
	(700, 285, 120, 1),
	(701, 285, 121, 1),
	(702, 285, 122, 1),
	(703, 286, 123, 1),
	(704, 286, 124, 0),
	(705, 286, 125, 1),
	(706, 286, 159, 0),
	(707, 286, 160, 1),
	(708, 287, 126, 1),
	(709, 287, 127, 1),
	(710, 287, 128, 1),
	(711, 287, 129, 0),
	(712, 287, 130, 1),
	(713, 287, 131, 0),
	(714, 287, 132, 0),
	(715, 287, 133, 1),
	(716, 288, 134, 1),
	(717, 288, 135, 1),
	(718, 288, 136, 1),
	(719, 288, 137, 1),
	(720, 288, 138, 1),
	(761, 297, 117, 1),
	(762, 297, 118, 1),
	(763, 297, 119, 1),
	(764, 297, 120, 1),
	(765, 297, 121, 1),
	(766, 297, 122, 1),
	(767, 298, 123, 1),
	(768, 298, 124, 0),
	(769, 298, 125, 1),
	(770, 298, 159, 0),
	(771, 298, 160, 1),
	(772, 299, 126, 1),
	(773, 299, 127, 1),
	(774, 299, 128, 1),
	(775, 299, 129, 0),
	(776, 299, 130, 1),
	(777, 299, 131, 0),
	(778, 299, 132, 0),
	(779, 299, 133, 1),
	(780, 300, 134, 1),
	(781, 300, 135, 1),
	(782, 300, 136, 1),
	(783, 300, 137, 1),
	(784, 300, 138, 1),
	(845, 325, 176, 1),
	(846, 326, 177, 0),
	(847, 326, 178, 1),
	(848, 327, 166, 0),
	(849, 327, 167, 0),
	(850, 327, 168, 1),
	(851, 328, 179, 1),
	(852, 328, 180, 0),
	(853, 328, 181, 0),
	(854, 328, 182, 0);
/*!40000 ALTER TABLE `exam_impro_ap_criteria` ENABLE KEYS */;

-- Dumping structure for table entities.exam_impro_ap_parameter
CREATE TABLE IF NOT EXISTS `exam_impro_ap_parameter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_impro_ap_id` int(11) NOT NULL,
  `exam_impro_parameter_id` int(11) NOT NULL,
  `maestro_id` int(11) NOT NULL,
  `completado` tinyint(1) NOT NULL,
  `comentario` varchar(200) DEFAULT NULL,
  `grade` decimal(10,1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maestro_id` (`maestro_id`),
  KEY `exam_impro_ap_parameter_ibfk_2` (`exam_impro_parameter_id`),
  KEY `exam_impro_ap_parameter_ibfk_1` (`exam_impro_ap_id`) USING BTREE,
  CONSTRAINT `exam_impro_ap_parameter_ibfk_1` FOREIGN KEY (`exam_impro_ap_id`) REFERENCES `exam_impro_ap` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_impro_ap_parameter_ibfk_2` FOREIGN KEY (`exam_impro_parameter_id`) REFERENCES `exam_impro_parameter` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_impro_ap_parameter_ibfk_3` FOREIGN KEY (`maestro_id`) REFERENCES `maestro` (`id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`completado` in (0,1))
) ENGINE=InnoDB AUTO_INCREMENT=329 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_impro_ap_parameter: ~12 rows (approximately)
/*!40000 ALTER TABLE `exam_impro_ap_parameter` DISABLE KEYS */;
INSERT INTO `exam_impro_ap_parameter` (`id`, `exam_impro_ap_id`, `exam_impro_parameter_id`, `maestro_id`, `completado`, `comentario`, `grade`) VALUES
	(285, 112, 52, 86, 1, '', NULL),
	(286, 112, 53, 85, 1, '', NULL),
	(287, 112, 54, 90, 1, '', NULL),
	(288, 112, 55, 91, 1, '', NULL),
	(297, 115, 52, 87, 1, '', NULL),
	(298, 115, 53, 91, 1, '', NULL),
	(299, 115, 54, 91, 1, '', NULL),
	(300, 115, 55, 91, 1, '', NULL),
	(325, 129, 58, 1, 1, '', NULL),
	(326, 129, 59, 2, 1, '', NULL),
	(327, 129, 60, 85, 1, '', NULL),
	(328, 129, 63, 86, 1, '', NULL);
/*!40000 ALTER TABLE `exam_impro_ap_parameter` ENABLE KEYS */;

-- Dumping structure for table entities.exam_impro_ap_question
CREATE TABLE IF NOT EXISTS `exam_impro_ap_question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_impro_ap_criteria_id` int(11) NOT NULL,
  `exam_impro_question_id` int(11) NOT NULL,
  `graded` decimal(10,1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `criteria_question_unique` (`exam_impro_ap_criteria_id`,`exam_impro_question_id`),
  KEY `FK_exam_impro_ap_question_exam_impro_question` (`exam_impro_question_id`),
  CONSTRAINT `FK_exam_impro_ap_question_exam_impro_ap_criteria` FOREIGN KEY (`exam_impro_ap_criteria_id`) REFERENCES `exam_impro_ap_criteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_exam_impro_ap_question_exam_impro_question` FOREIGN KEY (`exam_impro_question_id`) REFERENCES `exam_impro_question` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1652 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_impro_ap_question: ~168 rows (approximately)
/*!40000 ALTER TABLE `exam_impro_ap_question` DISABLE KEYS */;
INSERT INTO `exam_impro_ap_question` (`id`, `exam_impro_ap_criteria_id`, `exam_impro_question_id`, `graded`) VALUES
	(1447, 761, 250, 1.0),
	(1448, 761, 251, 1.0),
	(1449, 761, 249, 0.8),
	(1450, 762, 252, 0.8),
	(1451, 762, 253, 0.8),
	(1452, 763, 257, 0.8),
	(1453, 763, 255, 1.0),
	(1454, 763, 256, 1.0),
	(1455, 763, 254, 1.0),
	(1456, 764, 261, 1.0),
	(1457, 764, 259, 0.8),
	(1458, 764, 260, 1.0),
	(1459, 764, 258, 0.8),
	(1460, 765, 263, 0.8),
	(1461, 765, 262, 1.0),
	(1462, 766, 267, 1.0),
	(1463, 766, 265, 0.8),
	(1464, 766, 274, 1.0),
	(1465, 766, 272, 0.8),
	(1466, 766, 270, 1.0),
	(1467, 766, 268, 0.8),
	(1468, 766, 266, 1.0),
	(1469, 766, 264, 0.8),
	(1470, 766, 273, 1.0),
	(1471, 766, 271, 0.8),
	(1472, 766, 269, 0.6),
	(1473, 697, 251, 1.0),
	(1474, 703, 277, 0.8),
	(1475, 703, 275, 0.8),
	(1476, 697, 249, 1.0),
	(1477, 703, 278, 1.0),
	(1478, 697, 250, 1.0),
	(1479, 703, 276, 0.8),
	(1480, 698, 253, 1.0),
	(1481, 704, 281, 1.0),
	(1482, 698, 252, 1.0),
	(1483, 704, 279, 1.0),
	(1484, 699, 257, 1.0),
	(1485, 704, 280, 1.0),
	(1486, 699, 255, 1.0),
	(1487, 705, 285, 1.0),
	(1488, 705, 283, 1.0),
	(1489, 699, 256, 1.0),
	(1490, 705, 286, 0.8),
	(1491, 699, 254, 1.0),
	(1492, 705, 284, 0.8),
	(1493, 700, 261, 0.8),
	(1494, 705, 282, 1.0),
	(1495, 700, 259, 0.8),
	(1496, 706, 349, 1.0),
	(1497, 706, 347, 1.0),
	(1498, 700, 260, 1.0),
	(1499, 706, 350, 1.0),
	(1500, 700, 258, 1.0),
	(1501, 706, 348, 1.0),
	(1502, 701, 262, 1.0),
	(1503, 707, 354, 1.0),
	(1504, 701, 263, 1.0),
	(1505, 707, 352, 1.0),
	(1506, 702, 274, 1.0),
	(1507, 707, 353, 0.6),
	(1508, 707, 351, 0.8),
	(1509, 702, 272, 1.0),
	(1510, 702, 270, 1.0),
	(1511, 702, 268, 1.0),
	(1512, 702, 266, 1.0),
	(1513, 702, 264, 1.0),
	(1514, 702, 273, 1.0),
	(1515, 702, 271, 1.0),
	(1516, 702, 269, 1.0),
	(1517, 702, 267, 1.0),
	(1518, 702, 265, 0.8),
	(1556, 710, 295, 0.2),
	(1557, 710, 296, 0.2),
	(1558, 710, 294, 0.2),
	(1559, 712, 300, 0.2),
	(1560, 708, 291, 0.2),
	(1561, 708, 289, 0.2),
	(1562, 708, 287, 0.2),
	(1563, 708, 290, 0.2),
	(1564, 708, 288, 0.2),
	(1565, 709, 293, 0.2),
	(1566, 709, 292, 0.2),
	(1567, 715, 304, 0.2),
	(1568, 715, 307, 0.2),
	(1569, 715, 305, 0.2),
	(1570, 715, 303, 0.2),
	(1571, 715, 306, 0.2),
	(1572, 716, 312, 1.0),
	(1573, 716, 310, 1.0),
	(1574, 716, 308, 1.0),
	(1575, 716, 311, 1.0),
	(1576, 716, 309, 1.0),
	(1577, 717, 314, 1.0),
	(1578, 717, 315, 1.0),
	(1579, 717, 313, 1.0),
	(1580, 719, 320, 1.0),
	(1581, 719, 319, 1.0),
	(1582, 718, 318, 1.0),
	(1583, 718, 316, 1.0),
	(1584, 718, 317, 1.0),
	(1585, 720, 322, 1.0),
	(1586, 720, 329, 1.0),
	(1587, 720, 327, 1.0),
	(1588, 720, 325, 1.0),
	(1589, 720, 323, 1.0),
	(1590, 720, 321, 1.0),
	(1591, 720, 328, 1.0),
	(1592, 720, 326, 1.0),
	(1593, 720, 324, 1.0),
	(1594, 780, 308, 0.8),
	(1595, 780, 311, 0.4),
	(1596, 780, 309, 1.0),
	(1597, 780, 312, 1.0),
	(1598, 780, 310, 0.4),
	(1599, 781, 315, 1.0),
	(1600, 781, 313, 0.6),
	(1601, 781, 314, 1.0),
	(1602, 783, 319, 0.4),
	(1603, 783, 320, 1.0),
	(1604, 782, 317, 0.6),
	(1605, 782, 318, 1.0),
	(1606, 782, 316, 0.4),
	(1607, 784, 325, 0.4),
	(1608, 784, 323, 1.0),
	(1609, 784, 321, 1.0),
	(1610, 784, 328, 0.6),
	(1611, 784, 326, 0.4),
	(1612, 784, 324, 1.0),
	(1613, 784, 322, 0.6),
	(1614, 784, 329, 1.0),
	(1615, 784, 327, 0.4),
	(1616, 767, 278, 0.2),
	(1617, 767, 276, 0.2),
	(1618, 767, 277, 0.2),
	(1619, 767, 275, 0.2),
	(1620, 769, 285, 0.2),
	(1621, 769, 283, 0.2),
	(1622, 769, 286, 0.2),
	(1623, 769, 284, 0.2),
	(1624, 769, 282, 0.2),
	(1625, 771, 353, 0.2),
	(1626, 771, 351, 0.2),
	(1627, 771, 354, 0.2),
	(1628, 771, 352, 0.2),
	(1629, 845, 380, 0.2),
	(1630, 847, 385, 0.2),
	(1631, 847, 384, 0.2),
	(1632, 850, 365, 0.4),
	(1633, 850, 366, 0.4),
	(1634, 850, 364, 0.4),
	(1635, 851, 395, 0.6),
	(1636, 774, 296, 0.4),
	(1637, 774, 294, 0.6),
	(1638, 774, 295, 0.6),
	(1639, 776, 300, 0.6),
	(1640, 772, 291, 0.6),
	(1641, 772, 289, 0.4),
	(1642, 772, 287, 1.0),
	(1643, 772, 290, 0.6),
	(1644, 772, 288, 0.6),
	(1645, 773, 292, 1.0),
	(1646, 773, 293, 0.8),
	(1647, 779, 307, 0.6),
	(1648, 779, 305, 0.6),
	(1649, 779, 303, 0.6),
	(1650, 779, 306, 1.0),
	(1651, 779, 304, 1.0);
/*!40000 ALTER TABLE `exam_impro_ap_question` ENABLE KEYS */;

-- Dumping structure for view entities.exam_impro_calificacion
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `exam_impro_calificacion` (
	`ei_aplication_id` INT(11) NOT NULL,
	`fecha` DATE NULL,
	`materia` VARCHAR(200) NULL COLLATE 'utf8mb4_general_ci',
	`tipo` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`estudiante` VARCHAR(152) NULL COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`maestro` VARCHAR(152) NULL COLLATE 'utf8mb4_general_ci',
	`exam_impro_ap_parameter_id` INT(11) NOT NULL,
	`parametro` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`grade` DECIMAL(35,1) NULL
) ENGINE=MyISAM;

-- Dumping structure for view entities.exam_impro_calificacion_det
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `exam_impro_calificacion_det` (
	`fecha` DATE NULL,
	`id` INT(11) NOT NULL,
	`materia` VARCHAR(200) NULL COLLATE 'utf8mb4_general_ci',
	`tipo` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`estudiante` VARCHAR(152) NULL COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`exam_impro_ap_parameter_id` INT(11) NOT NULL,
	`maestro` VARCHAR(152) NULL COLLATE 'utf8mb4_general_ci',
	`parametro` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`question` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`calificacion` DECIMAL(12,1) NULL
) ENGINE=MyISAM;

-- Dumping structure for table entities.exam_impro_criteria
CREATE TABLE IF NOT EXISTS `exam_impro_criteria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(50) NOT NULL,
  `exam_impro_parameter_id` int(11) NOT NULL,
  `initially_selected` tinyint(4) NOT NULL DEFAULT 1,
  `idx` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_impro_parameter_id-label-parameter_id` (`label`,`exam_impro_parameter_id`),
  KEY `exam_impro_criteria_ibfk_1` (`exam_impro_parameter_id`),
  CONSTRAINT `exam_impro_criteria_ibfk_1` FOREIGN KEY (`exam_impro_parameter_id`) REFERENCES `exam_impro_parameter` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=183 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_impro_criteria: ~74 rows (approximately)
/*!40000 ALTER TABLE `exam_impro_criteria` DISABLE KEYS */;
INSERT INTO `exam_impro_criteria` (`id`, `label`, `exam_impro_parameter_id`, `initially_selected`, `idx`) VALUES
	(6, 'Aprendizaje Tecnico', 2, 1, 1),
	(8, 'Otros', 2, 1, 0),
	(9, 'Maestria con Alas', 2, 1, 2),
	(10, 'Presentacion', 2, 1, 3),
	(32, 'CUERPO', 5, 1, 0),
	(33, 'ESTETICA DEL MOVIMIENTO', 6, 1, 0),
	(34, 'EXPRESIÓN CORPORAL', 7, 1, 0),
	(35, 'MOVIMIENTO CORPORAL', 8, 1, 0),
	(76, 'Clariadad', 2, 1, 4),
	(82, 'Cuerpo', 44, 1, 0),
	(83, 'Espacio', 44, 1, 1),
	(84, 'Tiempo', 44, 1, 4),
	(85, 'Acción ', 44, 1, 2),
	(86, 'Energía ', 44, 1, 3),
	(87, 'Estética del Movimiento', 46, 1, 0),
	(88, 'Complemento Velo', 46, 1, 1),
	(89, 'Presentación', 46, 1, 2),
	(90, 'Expresión corporal', 47, 1, 0),
	(91, 'Expresión Facial', 47, 1, 3),
	(92, 'Imagen corporal', 47, 1, 1),
	(93, 'Rasgos de personalidad', 47, 1, 2),
	(94, 'Movimiento corporal', 48, 1, 1),
	(95, 'Musicología ', 48, 1, 0),
	(96, 'Temporalidad y estructura', 48, 1, 3),
	(97, 'Espacio', 48, 1, 2),
	(102, 'ESPACIO', 5, 1, 1),
	(103, 'TIEMPO', 5, 1, 2),
	(104, 'ACCION', 5, 1, 3),
	(105, 'ENERGIA', 5, 1, 4),
	(106, 'COMPLEMENTO VELO', 6, 1, 1),
	(107, 'PRESENTACION', 6, 1, 2),
	(108, 'EXPRESIVIDAD', 7, 1, 1),
	(109, 'IMAGEN CORPORAL', 7, 1, 2),
	(110, 'PERSONALIDAD', 7, 1, 3),
	(111, 'OTROS', 7, 1, 4),
	(112, 'MUSICOLOGIA', 8, 1, 1),
	(113, 'TEMPORALIDAD Y ESTRUCTURA', 8, 1, 3),
	(114, 'ESPACIO ', 8, 1, 2),
	(115, 'OTROS', 8, 1, 4),
	(116, 'OTROS', 5, 1, 5),
	(117, 'CUERPO', 52, 1, 0),
	(118, 'ESPACIO', 52, 1, 1),
	(119, 'TIEMPO', 52, 1, 2),
	(120, 'ACCION', 52, 1, 3),
	(121, 'ENERGIA', 52, 1, 4),
	(122, 'OTROS', 52, 1, 5),
	(123, 'ESTETICA DEL MOVIMIENTO', 53, 1, 0),
	(124, 'TAXIM', 53, 1, 1),
	(125, 'PRESENTACION', 53, 1, 2),
	(126, 'ACCION', 54, 1, 4),
	(127, 'TONO', 54, 1, 6),
	(128, 'CUERPO: VEHICULO DEL PENSAMIENTO', 54, 1, 0),
	(129, 'AMBIENTE', 54, 1, 5),
	(130, 'ESTILO DE EXPRESIÓN M', 54, 1, 3),
	(131, 'ESTILO DE EXPRESIÓN S', 54, 1, 2),
	(132, 'ESTILO DE EXPRESIÓN D', 54, 1, 1),
	(133, 'OTROS', 54, 1, 7),
	(134, 'MOVIMIENTO CORPORAL', 55, 1, 0),
	(135, 'MUSICOLOGIA', 55, 1, 1),
	(136, 'TEMPORALIDAD Y ESTRUCTURA', 55, 1, 3),
	(137, 'ESPACIO', 55, 1, 2),
	(138, 'OTROS', 55, 1, 4),
	(159, 'COMPLEMENTO ESPADA', 53, 1, 3),
	(160, 'SHAMADAN', 53, 1, 4),
	(166, 'Tiempo C 1', 60, 0, 0),
	(167, 'Tiempo C 2', 60, 0, 1),
	(168, 'Tiempo C 3', 60, 1, 2),
	(176, 'Cuerpo 1', 58, 1, 0),
	(177, 'espacio 2 1', 59, 0, 0),
	(178, 'Espacio 2 2', 59, 1, 1),
	(179, 'Energia C 1', 63, 1, 3),
	(180, 'Energia C 2', 63, 0, 2),
	(181, 'Energia C 3', 63, 0, 1),
	(182, 'Energia C 4', 63, 0, 0);
/*!40000 ALTER TABLE `exam_impro_criteria` ENABLE KEYS */;

-- Dumping structure for table entities.exam_impro_parameter
CREATE TABLE IF NOT EXISTS `exam_impro_parameter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_impro_type_id` int(11) DEFAULT NULL,
  `label` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_impro_parameter_ibfk_1` (`exam_impro_type_id`),
  CONSTRAINT `exam_impro_parameter_ibfk_1` FOREIGN KEY (`exam_impro_type_id`) REFERENCES `exam_impro_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_impro_parameter: ~17 rows (approximately)
/*!40000 ALTER TABLE `exam_impro_parameter` DISABLE KEYS */;
INSERT INTO `exam_impro_parameter` (`id`, `exam_impro_type_id`, `label`) VALUES
	(2, 1, 'Dificultad Tecnica y Complementos'),
	(5, 2, 'Habilidad Técnica '),
	(6, 2, 'Dificultad Técnica  y Complementos'),
	(7, 2, 'Expresión  Escénica '),
	(8, 2, 'Composición  Coreográfica'),
	(44, 9, 'Habilidad Técnica '),
	(46, 9, 'Dificultad técnica y Complementos'),
	(47, 9, 'Expresión'),
	(48, 9, 'Composición'),
	(52, 3, 'Habilidad técnica'),
	(53, 3, 'Dificultad técnica y Complementos'),
	(54, 3, 'Proyección'),
	(55, 3, 'Composición coreográfica '),
	(58, 16, 'Cuerpo 1'),
	(59, 16, 'Espacio 2'),
	(60, 16, 'Tiempo 3'),
	(63, 16, 'Energia 4');
/*!40000 ALTER TABLE `exam_impro_parameter` ENABLE KEYS */;

-- Dumping structure for table entities.exam_impro_question
CREATE TABLE IF NOT EXISTS `exam_impro_question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_impro_criteria_id` int(11) DEFAULT NULL,
  `label` varchar(50) NOT NULL,
  `description` varchar(500) NOT NULL,
  `points` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_impro_question_ibfk_1` (`exam_impro_criteria_id`),
  CONSTRAINT `exam_impro_question_ibfk_1` FOREIGN KEY (`exam_impro_criteria_id`) REFERENCES `exam_impro_criteria` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=396 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_impro_question: ~247 rows (approximately)
/*!40000 ALTER TABLE `exam_impro_question` DISABLE KEYS */;
INSERT INTO `exam_impro_question` (`id`, `exam_impro_criteria_id`, `label`, `description`, `points`) VALUES
	(31, 6, 'MIRADA', 'proyección, contacto visual, definición', 1),
	(32, 6, 'SONRISA EXPRESIVA', 'Para expresar diversos grados de placer, regocijo, alegria, felicidad, etc. (Ligeras, normales, amplias)', 1),
	(35, 8, 'DISCIPLINA', 'Alta capacidad de atención alas entradas y salidas del escenario, así como a las normas y principios de la danza.', 1),
	(36, 8, 'CAPACIDAD DE CONCENTRACION', 'Buena capacidad de concentración y razonamiento', 1),
	(37, 8, 'MEMORIA', 'Buena capacidad e recordar pasos, ideas, ', 1),
	(38, 8, 'PERSEVERANCIA', 'Capacidad de afrontar contratiempos', 1),
	(100, 76, 'Escriba otra', 'descripcion clara', 1),
	(106, 82, 'Línea corporal', 'colocación y alineación', 1),
	(107, 82, 'Equilibrio', 'equilibrio del cuerpo completo', 1),
	(108, 82, 'Flexibilidad', 'Capacidad que permite realizar movimientos con la máxima amplitud posible en una articulación determinada', 1),
	(109, 83, 'Dirección', 'Ondulaciones y golpes dirigidos', 1),
	(110, 83, 'Orientación', 'Optima orientacion de su cuerpo y movimientos hacia objetos o puntos en el espacio', 1),
	(111, 83, 'Ubicación', 'Manejo optimo de las lineas imaginarias que dividen el espacio de manera horizontal y vertical par ala creación del baile', 1),
	(112, 84, 'aspecto_1', 'descripcion de aspecto1', 1),
	(113, 85, 'Tamaño', 'Movimientos de impacto visibles, ondulaciones con elongación y amplitud ', 1),
	(114, 85, 'Agilidad', 'Capacidad de realizar los movimientos mostrando el mínimo esfuerzo y ahorrando energía, aun en situaciones que exigen: fuerza, velocidad, flexibilidad y resistencia.', 1),
	(115, 85, 'Control y ajuste', 'Reacción adecuada  a un estímulo constante (gravedad, shimmy, publico, afecciones, etc).', 1),
	(116, 85, 'Fluidez', 'Capacidad de reproducir con naturalidad y destreza las posturas y pasos en el baile.', 1),
	(117, 85, 'Transiciones', 'Capacidad de realizar con naturalidad  y destreza las tranciciones entre una secuencia y otra.', 1),
	(118, 86, 'Fuerza', '"Intensidad con que realiza un movimiento; un aumento  o  disminución de la energía y sus respectivas gradaciones. Ejemplo: liviano,  pesado, fuerte, débil, etc."', 1),
	(119, 87, 'Variedad', 'Diversidad de figuras, secuencias, niveles, direcciones y trayectorias espaciales', 1),
	(120, 87, 'Vigor', '"Viveza o eficacia de las acciones en la coreografía. Entonación o expresión enérgica en la representación de su obra."', 1),
	(121, 87, 'Ejecución', 'Etapa de coordinación: la ejecucíón tiene el costo energético adecuado, el gasto de fuerza necesario, los movimientos son fluidos, amplios y con ritmo lógico.', 1),
	(122, 88, 'Figuras', 'Velo de novia, burca, abanico, arcoíris', 1),
	(123, 88, 'Pasos característicos', 'Giros, ondulaciones', 1),
	(124, 88, 'Desafíos', '"La relación debe ser suave y delicada entre el cuerpo y el velo. Su función es crear diseños en el espacio, crear imágenes y formas. Requiere equilibrio en giros, cambios de movimiento y buena coordinación."', 1),
	(125, 88, 'Aspecto del velo', 'Planchados, en buenas condiciones, de seda o chiffon, longitud de 1.5 m', 1),
	(126, 89, 'Aseo personal', 'Cuerpo, cara, manos, rodillas y pies limpios.', 1),
	(127, 89, 'Vestuario o uniforme', 'limpio, firmemente cocido, ropa interior color carne, lencería no visible, ', 1),
	(128, 89, 'Maquillaje', 'Que acentúe las facciones de la bailarina o al personaje', 1),
	(129, 89, 'Peinado', 'Afín a la coreografía, sin cabellos en el rostro excepto que sea necesario para el baile', 1),
	(130, 89, 'Accesorios', 'Que ornamenten a la bailarina o decoren a personaje, firmemente sujetos y colocados de manera que no impidan la correcta ejecución.', 1),
	(131, 90, 'Posiciones y colocación', 'Alineación y colocación adecuadas, posiciones precisas', 1),
	(132, 90, 'Equilibrio ', 'Firmeza y solidez del cuerpo sobre su base de apoyo', 1),
	(133, 90, 'Movimientos ondulatorios    ', 'Elongación, amplitud, visibilidad y dirección.', 1),
	(134, 90, 'Movimientos de impacto', 'Golpes, dirigidos, fuertes, repentinos, con remates.', 1),
	(135, 90, 'Movimientos vibratorios', 'Optima velocidad, equilibrio y aceleración.', 1),
	(136, 90, 'Distensión', 'Eliminar tensión y fatiga mediante el dominio corporal', 1),
	(137, 90, 'Movimientos de transición', 'Mostrar naturalidad en la transicion entre un movimiento y otro.', 1),
	(138, 91, 'Mirada', 'proyección, contacto visual, definición', 1),
	(139, 91, 'Sonrisa expresiva', 'Para expresar diversos grados de placer, regocijo, alegria, felicidad, etc. (Ligeras, normales, amplias)', 1),
	(140, 92, 'Percepción del cuerpo', 'Se percibe cómoda con su apariencia', 1),
	(141, 92, 'Percepción motríz', 'Se percibe cómoda con los movimientos', 1),
	(142, 93, 'Disciplina ', 'Alta capacidad de atención tanto en  entradas y salidas del escenario,  como vigilancia en las normas y principios de la danza.', 1),
	(143, 93, 'Capacidad de concentración', 'Buena capacidad de concentración y razonamiento', 1),
	(144, 93, 'Memoria', 'Buena capacidad para recordar pasos, frases e ideas, ', 1),
	(145, 93, 'Perseverancia', 'Capacidad de afrontar contratiempos', 1),
	(146, 94, 'Posicione y colocación', 'Alineación y colocación adecuadas, posiciones precisas', 1),
	(147, 94, 'Balance', 'Equilibrio entre baile y acrobacias para conseguir movimientos eficaces.', 1),
	(148, 94, 'Equilibrio ', 'Firmeza y solidez del cuerpo sobre su base de apoyo', 1),
	(149, 94, 'Movimientos ondulatorios    ', 'Elongación, amplitud, visibilidad y dirección.', 1),
	(150, 94, 'Movimientos de Impacto .', 'Golpes, dirigidos, fuertes, repentinos, con remates.', 1),
	(151, 94, 'Movimientos vibratorios', 'Optima velocidad, equilibrio y aceleración.', 1),
	(152, 94, 'Movimientos de transición', 'Mostrar naturalidad en la transición entre un movimiento y otro.', 1),
	(153, 94, 'Desplazamientos y Trayectoria', 'Sentido de orientación en el espacio', 1),
	(154, 95, 'Instrumentación ', 'movimientos acordes con los instrumentos', 1),
	(155, 95, 'Sentido rítmico', 'Percibe la sucesión armoniosa y acompasada de la música.', 1),
	(156, 96, 'Tema', 'Asunto o materia a tratar en la obra.', 1),
	(157, 96, 'Orden', 'Planificación del baile.', 1),
	(158, 97, 'Espacio personal', 'Es el que ocupa el cuerpo de la bailarina', 1),
	(159, 97, 'Espacio escénico ', 'Uso del espacio  físico ', 1),
	(172, 32, ' Diseño corporal', 'La forma o líneas que adquiere el cuerpo en cualquier instante de una danza, pueden ser rectas o curvas (simétrica, asimétrica, estirada, encogida, doblada, redonda, angular o trenzada). Ejem: si un brazo está totalmente estirado y genera una recta, o si está redondeado y genera una curva.', 1),
	(173, 32, 'Gesto', 'Movimientos del cuerpo que expresan o sugieren algo. Expresiones faciales', 1),
	(174, 32, 'Disociación ', 'Movimientos diferenciados y separaciones evidentes.', 1),
	(175, 102, 'Uso del espacio', ' El movimiento en conexión con el medio y con las formas espaciales, los recorridos, y las líneas de tensión espacial (diseño en el espacio)', 1),
	(176, 102, 'Trayectoria', 'Los movimientos trazan líneas en el espacio que marcan su trayectoria. Pueden ser directas, curvas, rectas, angulares, en zigzag, inconexas o al azar.', 1),
	(177, 102, 'Proyección espacial ', 'Cuando la bailarina logra transmitir la energía de los movimientos o frases  más allá de su kinesfera, dando la ilusión de que la energía continua y no se rompe al terminar el segmento del cuerpo de donde proviene.', 1),
	(178, 103, 'Duración', 'Las frases y secuencias tienen el tiempo necesario para ser visibles, oscilaciones rápidas (movimientos vibratorios)', 1),
	(179, 103, 'Relaciones en el tiempo ', 'Realizar los movimientos y frases al unísono, de momento, de manera continua, predecible o impredecible, rápida o lentamente, pausas o momentos de quietud, etc.', 1),
	(180, 103, 'Frecuencia', 'Regularidad con que suceden los movimientos de las frases', 1),
	(181, 104, 'Coordinación', 'Habilidad y destreza para realizar los movimientos con cada segmento corporal de  manera precisa, ordenada y rápida o lenta', 1),
	(182, 104, 'Sentido o significado', 'Presentan la expresión verosímil de un sentimiento, una razón de ser, una finalidad, un modo particular de entender algo o el conocimiento cabal de una acción.', 1),
	(183, 104, 'Calidad', 'Conjunto de movimientos que contribuyen a hacer agradable y valioso el baile.', 1),
	(184, 104, 'Orden o simetría', 'Polaridad, esquema o patrón. Ejem: izquierda-derecha, saltar-agacharse, ABC', 1),
	(185, 105, 'Resistencia', 'El esfuerzo debe ser imperceptible al mantener un movimiento o paso durante el mayor tiempo posible, ', 1),
	(186, 105, 'Cualidad', 'Manifestación adecuada de energía en el baile, por ejemplo, de aspecto fluido, suspendido, suave, ondeante, suelto, apretado, agudo, balanceado o neutral.', 1),
	(187, 116, 'Linea corporal (cuerpo)', 'Colocación y  alineación óptima, posiciones precisas, movimientos elementales perfeccionados. Los movimientos dan énfasis a partes específicas del cuerpo: Cabeza, cuello, extremidades superiores, inferiores y tronco.', 1),
	(188, 116, 'Equilibrio (cuerpo)', 'Equilibrio del cuerpo completo con poca base de sustentación que se mantiene inmóvil y/o sin caerse.', 1),
	(189, 116, 'Flexibilidad (cuerpo)', 'Es la capacidad que permite realizar movimientos con la máxima amplitud posible en una articulación determinada.', 1),
	(190, 116, 'Ubicación (espacio ', 'Manejo óptimo de las lineas imaginarias que dividen el espacio de manera horizontal y vertical  para la creación del baile.  ', 1),
	(191, 116, 'Dirección (espacio)', 'Ondulaciones y golpes dirigidos. Desplazamientos con una dirección específica: hacia el frente, hacia atrás, hacia el lado, de manera diagonal. (Vagánova)', 1),
	(192, 116, 'Orientación optima (espacio) ', 'Optima orientación de su cuerpo y movimientos hacia objetos o puntos  en el espacio. Abierto (de frente), cerrado (de espalda), de perfil y cuartos. (Vagánova)', 1),
	(193, 116, 'Agilidad (acción)', 'Capacidad de realizar los movimientos mostrando el mínimo esfuerzo y ahorrando energía, aun en situaciones que exigen: fuerza, velocidad, flexibilidad y resistencia.', 1),
	(194, 116, 'Control y ajuste (acción)', 'Reacción adecuada  a un estímulo constante (gravedad, shimmy, publico, afecciones, etc).', 1),
	(195, 116, 'Fluidez (acción)', 'Capacidad de reproducir con naturalidad y destreza las posturas y pasos en el baile.', 1),
	(196, 116, 'Transiciones (acción)', 'Capacidad de realizar con naturalidad  y destreza las tranciciones entre una secuencia y otra.', 1),
	(197, 116, 'Fuerza (energía)', '"Intensidad con que realiza un movimiento; un aumento  o \ndisminución de la energía y sus respectivas gradaciones. Ejemplo: liviano,  pesado, fuerte, débil, etc."', 1),
	(198, 33, 'Variedad', 'Diversidad de figuras, secuencias, niveles, direcciones y trayectorias espaciales', 1),
	(199, 33, 'Vigor', '"Viveza o eficacia de las acciones en la coreografía.\nEntonación o expresión enérgica en la representación de su obra."', 1),
	(200, 33, 'Ejecución exitosa', 'Etapa de coordinación fina: La coordinación de los movimientos es exitosa aun en condiciones difíciles o no habituales. Los movimientos son fluidos y amplios de forma permanente', 1),
	(201, 106, 'Aspecto ', 'Velo limpios, planchado, tela de chiffon o seda (medidas de 2.50 x 1.20 m), los brillos en la piel son requeridos.', 1),
	(202, 106, 'Figuras', 'Burca, abanico, sobre , cascada corta y mariposa', 1),
	(203, 106, 'Pasos característicos', 'Mov. ondulatorios, vibratorios, giros y desplazamientos', 1),
	(204, 106, 'Desafíos', 'Fluidez, brazos con firmeza, movimientos armónicos y coordinados, el velo no se enreda , crea figuras en el espacio.', 1),
	(205, 107, 'Aseo personal', 'Cuerpo, cara, manos, rodillas y pies limpios.', 1),
	(206, 107, 'Vestuario ', 'limpio, firmemente cocido, ropa interior color carne, lencería no visible, ', 1),
	(207, 107, 'Maquillaje', 'Que acentúe a la bailarina o al personaje', 1),
	(208, 107, 'Peinado', 'Afín a la coreografía, sin cabellos en el rostro excepto que sea necesario para el baile', 1),
	(209, 107, 'Accesorios', 'Que ornamenten a la bailarina o decoren a personaje, firmemente sujetos y colocados de manera que no impidan la correcta ejecución.', 1),
	(210, 34, 'Coordinación corporal', 'Coordinación de los movimientos al realizar los cambios entre música y pasos', 1),
	(211, 34, 'Comunicación ', 'Movimientos justificados  que favorezcan el intercambio de información o que compartan un poco de sí mismas.', 1),
	(212, 34, 'Continuidad', 'Persistencia en el objetivo, significado o trayectoria del baile', 1),
	(213, 34, 'Creatividad', 'Ejecutar con gracia, elegancia, humor y sorpresa los pasos y transiciones.', 1),
	(214, 34, 'Confianza', 'Seguridad, confianza física y carisma al bailar.', 1),
	(215, 34, 'Intensidad', 'Energía, vehemencia, pasión, potencia, contacto visual, fortaleza y definición.', 1),
	(216, 34, 'Entendimiento musical', 'Entendimiento de música, letra y ritmos presentes.   ', 1),
	(217, 108, 'Manipulación ', 'Movimientos expresivos con las manos que creen objetos imaginarios, realicen acciones físicas, manifiesten intensión o sentimiento.', 1),
	(218, 108, 'Gesto Facial', 'Mirada, cejas, boca. Mostrar emociones como alegría, amor, tristeza, decepción, desprecio, ira, miedo, interés, maldad.', 1),
	(219, 109, 'Percepción pública', 'Se percibe cómoda ante la mirada de los demás', 1),
	(220, 109, 'Percepción motriz ', 'Se percibe cómoda con los movimientos', 1),
	(221, 109, 'Percepción del cuerpo', 'Se percibe cómoda con su apariencia', 1),
	(222, 110, 'Estilo', 'Mostrar los rasgos peculiares que la caracterizan como persona y/o bailarina', 1),
	(223, 110, 'Resistencia', 'Capacidad de mantenerse en control ante situaciones difíciles y  de estrés.', 1),
	(224, 111, 'Posiciones y colocación', 'Alineación y colocación adecuadas, posiciones precisas', 1),
	(225, 111, 'Equilibrio ', 'Firmeza y solidez del cuerpo sobre su base de apoyo', 1),
	(226, 111, 'Movimientos Ondulatorios.    ', 'Elongación, amplitud, visibilidad y dirección.', 1),
	(227, 111, 'Movimientos de Impacto ', 'Golpes, dirigidos, fuertes, repentinos, con remates.', 1),
	(228, 111, 'Movimientos vibratorios ', 'Optima velocidad, equilibrio y aceleración.', 1),
	(229, 111, 'Disciplina ', 'Alta capacidad de atención alas entradas y salidas del escenario, así como a las normas y principios de la danza.', 1),
	(230, 111, 'Capacidad de concentración', 'Buena capacidad de concentración y razonamiento', 1),
	(231, 111, 'Memoria', 'Buena capacidad para recordar pasos, frases e ideas.', 1),
	(232, 35, 'Variedad de movimientos', 'Diversidad de movimeintos, pasos y secuencias', 1),
	(233, 35, 'Variedad de transiciones', 'Diversidad al iniciar  y finalizar movimientos, pasos y secuencias del baile en su totalidad', 1),
	(234, 35, 'Agilidad / Acción', 'Movimientos en varias direcciones con velocidad, pausas, control y ligereza.', 1),
	(235, 35, 'Fluidez', 'Naturalidad al  ejecutar secuencias y pasos.', 1),
	(236, 112, 'Percepción musical', 'Percibe y utiliza la melodía, instrumentos y voz en la música', 1),
	(237, 112, 'Ritmo y Métrica', 'Distingue y utiliza el pulso y el acento dando énfasis al ritmo.', 1),
	(238, 112, 'Relación en el tiempo', 'Realizar movimientos al unísono, de momento o continuos; predecibles o impredecible; rápidos o lentos', 1),
	(239, 113, 'Tema', 'Justificación de los movimientos, pasos y secuencias. ', 1),
	(240, 113, 'Orden', 'Planificación y desarrollo del baile.', 1),
	(241, 113, 'Tiempo', 'Duración de los movimientos', 1),
	(242, 114, 'Espacio parcial', 'Uso del espacio sin desplazamiento', 1),
	(243, 114, 'Espacio restringido', 'Uso del espacio con desplazamiento lineal, curvo o circular.', 1),
	(244, 114, 'Dirección', 'Orientación definida en el espacio.', 1),
	(245, 115, 'Posiciones y colocación', 'Alineación y colocación adecuadas, posiciones precisas', 1),
	(246, 115, 'Movimientos Ondulatorios.    ', 'Elongación, amplitud, visibilidad y dirección.', 1),
	(247, 115, 'Movimientos vibratorios ', 'Optima velocidad, equilibrio y aceleración.', 1),
	(248, 115, 'Movimientos de Impacto .', 'Golpes, dirigidos, fuertes, repentinos, con remates.', 1),
	(249, 117, 'Sistemas del cuerpo', 'La manera en que la bailarina utiliza la respiración, el sistema muscular, el esqueleto, los órganos del cuerpo, el balance y reflejos para expresar en el baile.', 1),
	(250, 117, 'Conciencia corporal', 'Tiene conciencia de las posibilidades y limitaciones del cuerpo', 1),
	(251, 117, 'Forma de las frases', 'El cuerpo muestra formas definidas durante las acciones y sus transformaciones ', 1),
	(252, 118, 'Nivel', 'Manejo adecuado de los niveles: medio, medio-alto, medio-bajo, bajo y piso', 1),
	(253, 118, 'Progresión espacial ', 'Son las rectas y curvas imaginarias que la bailarina traza al desplazarse por el espacio general (total). Las intenciones del movimiento ayudarán al espectador a visualizar fácilmente estas líneas.', 1),
	(254, 119, 'Duración', 'Las frases, secuencias y secciones en la coreografía tienen el tiempo necesario para ser comprendidas por el espectador', 1),
	(255, 119, 'Velocidad', 'Los movimientos, frases y secuencias cuentan con las variaciones de velocidad adecuadas.', 1),
	(256, 119, 'Intensidad', 'Correctos matices de las frases, secuencias y secciones en la coreografía', 1),
	(257, 119, 'Ritmo ', 'El significado de las secuencias se presenta de forma organizada: inicio, desarrollo y final', 1),
	(258, 120, 'Mov. estacionarios precisos', 'Precisión en los movimientos que se ejecutan en un punto específico del espacio sin viajar mucho, Ejem.: caídas, el estiramiento o golpes con una parte del cuerpo, giros en sitio, etc.', 1),
	(259, 120, 'Mov. desplazados precisos', 'Precisión en los movimientos que se trasladan en el espacio tales como correr, saltar cubriendo mucho espacio, caminar o gatear', 1),
	(260, 120, 'Fluidez', 'Todos los movimientos, pasos y secuencias tienen una justificación o motivo dentro de la coreografía o corresponden al tipo de baile.', 1),
	(261, 120, 'Expresión', 'Gesticulación, mov o actitud del cuerpo donde se manifieste disposición, intención o sentimiento ', 1),
	(262, 121, 'Peso', 'La energía que hace liviano un movimiento, la fuerza que lo hace rebotar, que envía el peso hacia arriba o hacia abajo, que se estira horizontalmente, que empuja el peso en el espacio, ', 1),
	(263, 121, 'Potencia', 'Dominio de la cantidad  de fuerza (energía) con la que la bailarina ejecuta las frases y secuencias en la coreografía.', 1),
	(264, 122, ' Diseño corporal (cuerpo)', 'La forma o líneas que adquiere el cuerpo en cualquier instante de una danza, pueden ser rectas o curvas (simétrica, asimétrica, estirada, encogida, doblada, redonda, angular o trenzada). Ejem: si un brazo está totalmente estirado y genera una recta, o si está redondeado y genera una curva.', 1),
	(265, 122, 'Gesto (cuerpo)', 'Movimientos del cuerpo que expresan o sugieren algo. Expresiones faciales', 1),
	(266, 122, 'Equilibrio (cuerpo)', 'Equilibrio del cuerpo completo con poca base de sustentación que se mantiene inmóvil y/o sin caerse.', 1),
	(267, 122, 'Flexibilidad (cuerpo)', 'Es la capacidad que permite realizar movimientos con la máxima amplitud posible en una articulación determinada.', 1),
	(268, 122, 'Disociación (cuerpo)', 'Movimientos diferenciados y separaciones evidentes.', 1),
	(269, 122, 'Trayectoria (espacio)', 'Los movimientos trazan líneas en el espacio que marcan su trayectoria. Pueden ser directas, curvas, rectas, angulares, en zigzag, inconexas o al azar.', 1),
	(270, 122, 'Relaciones en el tiempo (tiempo)', 'Realizar los movimientos y frases al unísono, de momento, de manera continua, predecible o impredecible, rápida o lentamente, pausas o momentos de quietud, etc.', 1),
	(271, 122, 'Frecuencia (tiempo)', 'Regularidad con que suceden los movimientos de las frases', 1),
	(272, 122, 'Cualidad (ernergía)', 'Manifestación adecuada de energía en el baile, por ejemplo, de aspecto fluido, suspendido, suave, ondeante, suelto, apretado, agudo, balanceado o neutral.', 1),
	(273, 122, 'Fuerza (energía)', '"Intensidad con que realiza un movimiento; un aumento  o \ndisminución de la energía y sus respectivas gradaciones. Ejemplo: liviano,  pesado, fuerte, débil, etc."', 1),
	(274, 122, 'Resistencia (energía)', 'El esfuerzo debe ser imperceptible al mantener un movimiento o paso durante el mayor tiempo posible, ', 1),
	(275, 123, 'Variedad', 'Diversidad de figuras, secuencias, niveles, direcciones y trayectorias espaciales', 1),
	(276, 123, 'Vigor', '"Viveza o eficacia de las acciones en la coreografía.\nEntonación o expresión enérgica en la representación de su obra."', 1),
	(277, 123, 'Sincronización estética', 'Transmite satisfacción estética a los espectadores cuando la ejecución tiene armonía, gracia y belleza. La bailarina muestra su creatividad relacionando expresiones personales con la música y los movimientos corporales de manera fluida', 1),
	(278, 123, 'Ejecución consolidada', 'Etapa de consolidación: La automatización permite a la bailarina centralizar la atención en los puntos críticos del desarrollo motor.', 1),
	(279, 124, 'Aspecto ', '', 1),
	(280, 124, 'Pasos característicos', 'Movimientos ondulatorios y vibratorios, desplazamientos reducidos, movimientos precisos con el instrumento de la melodía. ', 1),
	(281, 124, 'Desafíos', 'Máximo sentido de la melodía, relacionando instrumento respecto al movimiento característico a dicho instrumento. Optima concentración y emoción intrínseca. Excelente coordinación psicomotora y precisión. Variedad de combinaciones en un espacio reducido en el escenario', 1),
	(282, 125, 'Aseo personal', 'Cuerpo, cara, manos, rodillas y pies limpios.', 1),
	(283, 125, 'Vestuario', 'limpio, firmemente cocido, ropa interior color carne, lencería no visible, ', 1),
	(284, 125, 'Maquillaje', 'Que acentúe a la bailarina o al personaje', 1),
	(285, 125, 'Peinado', 'Afín a la coreografía, sin cabellos en el rostro excepto que sea necesario para el baile', 1),
	(286, 125, 'Accesorios', 'Que ornamenten a la bailarina o decoren a personaje, firmemente sujetos y colocados de manera que no impidan la correcta ejecución.', 1),
	(287, 126, 'Tensión (del bailarín)', 'Acelerar o ralentizar (prolongar) la acción, detenerla para que hable la música, anticipar o posponer hechos, ocultar datos y reservarlos para el momento oportuno, ofrecer pistas falsas, centrar la atención en determinados aspectos con menosprecio de otros, etc.', 1),
	(288, 126, 'Orden (del bailarín)', 'Precisión en el Orden de los acontecimientos: cronológicamente (lineal), la historia comienza y acaba del mismo modo (circular), o en medio del asunto (in media res)', 1),
	(289, 126, 'Situación inicial (del personaje)', 'Presentación del personaje: descripción del espacio, tiempo, detalles especiales, rasgos o lugar', 1),
	(290, 126, 'Desarrollo (del personaje)', 'Narración de la obra: Acciones derivadas de la situación inicial planteada por el personaje.', 1),
	(291, 126, 'Desenlace (del personaje)', 'Cierre de la narración: Debe existir correlación lógica entre los hechos precedentes y el final o solución que desencadenan.', 1),
	(292, 127, 'Actitud  (del personaje)', 'Perspectiva adoptada por un personaje, con respecto a un, pensamiento, lugar o desarrollo de la obra, a través de emociones. Ejem.: Solemne, crítico, irónico, humorístico', 1),
	(293, 127, 'Imaginación y claridad (del bailarín) ', 'Imaginación para dar vida a los símbolos que sin revelar las pasiones desnudas, hablen de ellas con claridad', 1),
	(294, 128, 'Movimiento sensible (del bailarín)', 'Estado anímico: El Movimiento y la energía se unen para proyectar la emoción que se pretende (ira, miedo, tristeza, alegría, etc)', 1),
	(295, 128, 'Pensamiento motriz (del bailarín)', 'El movimiento y el gesto transmiten el pensamiento con todo el cuerpo del bailarín', 1),
	(296, 128, 'Dominio corporal (del bailarín)', 'Movimiento corporal voluntario y controlado por el bailarina', 1),
	(297, 129, 'Espacio Físico (del personaje)', '"Abierto = Espacio que da libertad al personaje para actuar\nCerrado: Espacio que limita o estorba las acciones que ejecuta el personaje"', 1),
	(298, 129, 'Espacio Psicológico (del personaje)', 'Ambiente que rodea al entorno e influye en las formas de actuar .', 1),
	(299, 129, 'Espacio Social (del personaje)', 'Espacio cultural, ideas etico-morales, pensamientos religiosos, políticos, nivel social, econoómico, etc.', 1),
	(300, 130, 'Monólogo', 'La expresión en el baile es de forma unilateral extrovertida.. La intérprete baila mostrando sus emociones haciendo contacto con el público observa.', 1),
	(301, 131, 'Soliloquio', 'La expresión en el baile es de forma unilateral introvertida. La intérprete baila mostrando sus emociones sin hacer contacto con el público, para sí misma (una reflexión “en voz alta”). Eje: Taxim, Zaar.', 1),
	(302, 132, 'Coloquio', 'La expresión en el baile es de forma bilateral. La intérprete y el público interactúan en el baile, como un “diálogo”.  Ejm: Drum', 1),
	(303, 133, 'Posiciones y colocación', 'Alineación y colocación adecuadas, posiciones precisas', 1),
	(304, 133, 'Movimientos Ondulatorios.    ', 'Elongación, amplitud, visibilidad y dirección.', 1),
	(305, 133, 'Movimientos vibratorios', 'Optima velocidad, equilibrio y aceleración.', 1),
	(306, 133, 'Movimientos de Impacto .', 'Golpes, dirigidos, fuertes, repentinos, con remates.', 1),
	(307, 133, 'Equilibrio ', 'Firmeza y solidez del cuerpo sobre su base de apoyo', 1),
	(308, 134, 'Calidad de movimientos', 'Conjunto de movimientos que hacen agradable y valioso el baile', 1),
	(309, 134, 'Precisión ', 'Exactitud en los movimientos, transiciones y secuencias.', 1),
	(310, 134, 'Agilidad / Acción', 'Movimientos en varias direcciones con velocidad, pausas, control y ligereza.', 1),
	(311, 134, 'Energía', 'Cualidades físicas y emocionales que caracterizan a un movimiento', 1),
	(312, 134, '"Conciencia corporal "', '"Conciencia de las posibilidades y limitaciones de su cuerpo.\nConciencia de posturas y movimientos con respecto al campo visual del público (frontal, contrario, espaldas, 3/4)"', 1),
	(313, 135, 'Entendimiento miusical', 'Entiende y utiliza la letra, instrumentos y melodía de la música', 1),
	(314, 135, 'Interacción musical', 'Responde a los estímulos músicales', 1),
	(315, 135, 'Marcaje', 'Utiliza el ritmo para marcar  movimientos opuestos o diferentes', 1),
	(316, 136, 'Orden', 'Transformación del baile de menos a mas o viceversa ', 1),
	(317, 136, 'Tiempo', 'Duración de los movimientos', 1),
	(318, 136, 'Frecuencia', 'Regularidad con que suceden o se repiten los movimientos.', 1),
	(319, 137, 'Diversidad espacial', 'diversidad de movimientos en el espacio', 1),
	(320, 137, 'Espacio compartido', 'Dialogo corporal e interacción con otros espacios o personas. Mi espacio, tu espacio, nuestro espacio.', 1),
	(321, 138, 'Movimientos Ondulatorios', 'Elongación, amplitud, visibilidad y dirección.', 1),
	(322, 138, 'Movimientos de Impacto ', 'Golpes, dirigidos, fuertes, repentinos, con remates.', 1),
	(323, 138, 'Movimientos vibratorios', 'Optima velocidad, equilibrio y aceleración.', 1),
	(324, 138, 'Variedad de movimientos y transiciones', 'Diversidad en pasos, secuencias, inicios y finales.', 1),
	(325, 138, 'Fluidez', 'Naturalidad al  ejecutar secuencias y pasos.', 1),
	(326, 138, 'Relación en el tiempo', 'Realizar movimientos al unísono, de momento o continuos; predecibles o impredecible; rápidos o lentos', 1),
	(327, 138, 'Metrica', 'Distingue y utiliza el tiempo,  pulso y el acento, dando énfasis al ritmo.', 1),
	(328, 138, 'Tema', 'Justificación de los movimientos, pasos y secuencias. ', 1),
	(329, 138, 'Dirección', 'Orientación definida en el espacio.', 1),
	(347, 159, 'Formas', 'Equilibrios sobre: cabeza en escorpión, en la “escuadra” , planta del pie en la vela, \nEquilibrio en el torso en caida turca.', 1),
	(348, 159, 'Pasos característicos', 'Movimientos ondulatorios, de impacto y vibratorios.\nNiveles: medio, bajo y piso\nPasos:  el escorpión, la caída turca y la escuadra.', 1),
	(349, 159, 'Desafíos', '-Optima coordinación psicomotora y precisión. \n-Máximo equilibrio del complemento.\n-Movimientos y transiciones mostrando fuerza y seguridad \n-Perfecto sentido del ritmo y melodía.', 1),
	(350, 159, 'Aspecto ', '-La espadas debe estar completa de punta a mango.\n-Sables de utileria para belly dance, bien equilibradas.\n-La espada debe ser  curva, de aluminio, peso de 600 a 800 gr. \nancho 80 cm a 1 m de largo.\n-Vestimenta: dos piezas con pantalón.', 1),
	(351, 160, 'Formas ', 'Se mantiene firme sobre la cabeza, sin quitarlo en ningún momento y equilibrado.', 1),
	(352, 160, 'Pasos característicos', 'Movimientos ondulatorios, solares y vibratorios \nNivel: medio, bajo y piso.', 1),
	(353, 160, 'Desafíos', '-Máximo equilibrio.\n-Fuerza del cuello  \n-Seguridad y confianza al ejecutar los movimientos y transiciones. \n-Sentido del ritmo y melodía ', 1),
	(354, 160, 'Aspecto ', '', 1),
	(360, 166, 'tiempo1-1', 'desc tiempo 1-1', 1),
	(362, 167, 'tiempo 2-1', 'desc tiempo 2-1', 1),
	(363, 167, 'tiempo2-2', 'desc tiempo 2-2', 1),
	(364, 168, 'tiempo  3-1', 'desc tiempo 3-1', 1),
	(365, 168, 'tiempo 3-2', 'desc tiempo 3-2', 1),
	(366, 168, 'tiempo 3-3', 'desc tiempo 3-3', 1),
	(380, 176, 'cuerpo 1-1', 'desc cuerpo 1-1', 1),
	(381, 177, 'espacio 2-1', 'desc espacio 2-1', 1),
	(384, 178, 'espacio 2-1', 'desc espacio 2-1', 1),
	(385, 178, 'espacio 2-2', 'desc espacio 2-2', 1),
	(386, 182, 'Energia 4-1', 'desc Energia 4-1', 1),
	(387, 182, 'Energia 4-2', 'desc Energia 4-2', 1),
	(388, 182, 'Energia 4-3', 'desc Energia 4-3', 1),
	(389, 182, 'Energia 4-4', 'desc Energia 4-4', 1),
	(390, 181, 'Energia 3-1', 'desc Energia 3-1', 1),
	(391, 181, 'Energia 3-2', 'desc Energia 3-2', 1),
	(392, 181, 'Energia 3-3', 'desc Energia 3-3', 1),
	(393, 180, 'Energia 2-1', 'desc Energia 2-1', 1),
	(394, 180, 'Energia 2-2', 'desc Energia 2-2', 1),
	(395, 179, 'Energia 1-1', 'desc Energia 1-1', 1);
/*!40000 ALTER TABLE `exam_impro_question` ENABLE KEYS */;

-- Dumping structure for table entities.exam_impro_type
CREATE TABLE IF NOT EXISTS `exam_impro_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_impro_type: ~5 rows (approximately)
/*!40000 ALTER TABLE `exam_impro_type` DISABLE KEYS */;
INSERT INTO `exam_impro_type` (`id`, `label`) VALUES
	(1, 'prueba'),
	(2, 'Improvisación 2º nivel'),
	(3, 'Improvisación 3º nivel'),
	(9, 'Improvisación 1º nivel'),
	(16, 'Primero casi cuarto');
/*!40000 ALTER TABLE `exam_impro_type` ENABLE KEYS */;

-- Dumping structure for table entities.exam_row
CREATE TABLE IF NOT EXISTS `exam_row` (
  `row_id` int(11) NOT NULL AUTO_INCREMENT,
  `exercise_id` int(11) DEFAULT NULL,
  `label` varchar(50) NOT NULL,
  `ind` int(11) NOT NULL,
  `row_value` float NOT NULL,
  PRIMARY KEY (`row_id`),
  KEY `exercise_id` (`exercise_id`),
  CONSTRAINT `exam_row_ibfk_1` FOREIGN KEY (`exercise_id`) REFERENCES `exam_exercise` (`exercise_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.exam_row: ~40 rows (approximately)
/*!40000 ALTER TABLE `exam_row` DISABLE KEYS */;
INSERT INTO `exam_row` (`row_id`, `exercise_id`, `label`, `ind`, `row_value`) VALUES
	(1, 1, '4\'', 4, 0.6),
	(2, 1, '1\'', 1, 0.6),
	(3, 1, '5\'', 5, 0.6),
	(4, 1, '2\'', 2, 0.6),
	(5, 1, '3\'', 3, 0.6),
	(6, 2, '4\' Combinado', 3, 1),
	(7, 2, '2\' Fenix', 4, 1),
	(8, 2, '1\' Dentro del eje', 2, 1),
	(9, 2, '2\' Fuera del eje', 1, 1),
	(10, 3, 'Africana', 8, 1),
	(11, 3, 'Balance', 1, 1),
	(12, 3, 'Caderas incl', 5, 1),
	(13, 3, 'Camello-rev D', 12, 0.5),
	(14, 3, 'Camello-rev I', 13, 0.5),
	(15, 3, 'Circulo gde D', 10, 0.5),
	(16, 3, 'Circulo gde I', 11, 0.5),
	(17, 3, 'Circulo Peq', 9, 1),
	(18, 3, 'Maya', 7, 1),
	(19, 3, '8 ext', 3, 1),
	(20, 3, '8 int', 4, 1),
	(21, 3, 'Recogida', 6, 1),
	(22, 3, 'Twist', 2, 1),
	(23, 4, 'Africana', 9, 1),
	(24, 4, 'Balance', 1, 1),
	(25, 4, 'Caderas incl', 5, 1),
	(26, 4, 'Camello Pelvis', 13, 1),
	(27, 4, 'Camello Torso', 12, 1),
	(28, 4, 'Circulo gde D', 11, 1),
	(29, 4, 'Circulo Peq', 10, 1),
	(30, 4, 'Maya', 7, 1),
	(31, 4, '8 ext', 3, 1),
	(32, 4, '8 int', 4, 1),
	(33, 4, 'Recogida', 6, 1),
	(34, 4, 'Reverse Pelvis', 14, 1),
	(35, 4, 'Torso', 8, 1),
	(36, 4, 'Twist', 2, 1),
	(37, 5, 'IV', 4, 2),
	(38, 5, 'I', 1, 2),
	(39, 5, 'II', 2, 2),
	(40, 5, 'III', 3, 2);
/*!40000 ALTER TABLE `exam_row` ENABLE KEYS */;

-- Dumping structure for table entities.maestro
CREATE TABLE IF NOT EXISTS `maestro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidoPaterno` varchar(50) NOT NULL,
  `apellidoMaterno` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.maestro: ~9 rows (approximately)
/*!40000 ALTER TABLE `maestro` DISABLE KEYS */;
INSERT INTO `maestro` (`id`, `nombre`, `apellidoPaterno`, `apellidoMaterno`) VALUES
	(1, 'Claudia', 'Gamboa', 'Villa'),
	(2, 'Virginia', 'Gamboa', 'Villa'),
	(85, 'Blanca', 'Muñoz', ''),
	(86, 'Renata', 'Aleman', ' '),
	(87, 'Yelbiz', 'Villanueva', ' '),
	(88, 'Melina', 'Diaz', NULL),
	(89, 'AnaGaby', 'Dieck', NULL),
	(90, 'alumna1', '-', NULL),
	(91, 'alumna2', '-', NULL);
/*!40000 ALTER TABLE `maestro` ENABLE KEYS */;

-- Dumping structure for table entities.role
CREATE TABLE IF NOT EXISTS `role` (
  `id` varchar(50) NOT NULL,
  KEY `unique_role` (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.role: ~3 rows (approximately)
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` (`id`) VALUES
	('Admin'),
	('Estudiante'),
	('Maestro');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;

-- Dumping structure for table entities.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) NOT NULL,
  `password` varchar(50) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.user: ~9 rows (approximately)
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`id`, `user_name`, `password`) VALUES
	(1, 'claudia', 'Argos4905'),
	(2, 'virginia', 'Leia'),
	(3, 'blanca', 'munoz'),
	(5, 'renata', 'aleman'),
	(6, 'yelbiz', 'villanueva'),
	(7, 'melina', 'diaz'),
	(8, 'anagaby', 'dieck'),
	(9, 'alumna1', '1234'),
	(10, 'alumna2', '5678');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

-- Dumping structure for table entities.user_attribute
CREATE TABLE IF NOT EXISTS `user_attribute` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `maestro_id` int(11) DEFAULT NULL,
  `estudiante_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_user_attribute_user` (`user_id`),
  KEY `FK_user_attribute_maestro` (`maestro_id`),
  KEY `FK_user_attribute_estudiante` (`estudiante_id`),
  CONSTRAINT `FK_user_attribute_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiante` (`id`),
  CONSTRAINT `FK_user_attribute_maestro` FOREIGN KEY (`maestro_id`) REFERENCES `maestro` (`id`),
  CONSTRAINT `FK_user_attribute_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.user_attribute: ~9 rows (approximately)
/*!40000 ALTER TABLE `user_attribute` DISABLE KEYS */;
INSERT INTO `user_attribute` (`id`, `user_id`, `maestro_id`, `estudiante_id`) VALUES
	(1, 1, 1, NULL),
	(2, 2, 2, NULL),
	(3, 3, 85, NULL),
	(5, 5, 86, NULL),
	(6, 6, 87, NULL),
	(7, 7, 88, NULL),
	(8, 8, 89, NULL),
	(9, 9, 90, NULL),
	(10, 10, 91, NULL);
/*!40000 ALTER TABLE `user_attribute` ENABLE KEYS */;

-- Dumping structure for table entities.user_role
CREATE TABLE IF NOT EXISTS `user_role` (
  `user_id` int(11) NOT NULL,
  `role_id` varchar(50) NOT NULL,
  UNIQUE KEY `UNQ_user_role` (`user_id`,`role_id`),
  KEY `FK_user_role_role` (`role_id`),
  CONSTRAINT `FK_user_role_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table entities.user_role: ~11 rows (approximately)
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES
	(1, 'Admin'),
	(1, 'Maestro'),
	(2, 'Maestro'),
	(3, 'Estudiante'),
	(3, 'Maestro'),
	(5, 'Maestro'),
	(6, 'Maestro'),
	(7, 'Maestro'),
	(8, 'Maestro'),
	(9, 'Maestro'),
	(10, 'Maestro');
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;

-- Dumping structure for view entities.exam_impro_ap_calificacion
-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `exam_impro_ap_calificacion`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `exam_impro_ap_calificacion` AS select `exam_impro_calificacion`.`ei_aplication_id` AS `ei_aplication_id`,`exam_impro_calificacion`.`fecha` AS `fecha`,`exam_impro_calificacion`.`materia` AS `materia`,`exam_impro_calificacion`.`tipo` AS `tipo`,`exam_impro_calificacion`.`estudiante` AS `estudiante`,sum(`exam_impro_calificacion`.`grade`) / count(`exam_impro_calificacion`.`grade`) AS `grade` from `exam_impro_calificacion` group by `exam_impro_calificacion`.`ei_aplication_id`;

-- Dumping structure for view entities.exam_impro_calificacion
-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `exam_impro_calificacion`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `exam_impro_calificacion` AS select `a`.`id` AS `ei_aplication_id`,`a`.`fechaApplicacion` AS `fecha`,`a`.`materia` AS `materia`,`t`.`label` AS `tipo`,concat(`e`.`nombre`,' ',`e`.`apellidoPaterno`,' ',`e`.`apellidoMaterno`) AS `estudiante`,`e`.`email` AS `email`,concat(`m`.`nombre`,' ',`m`.`apellidoPaterno`,' ',`m`.`apellidoMaterno`) AS `maestro`,`c`.`exam_impro_ap_parameter_id` AS `exam_impro_ap_parameter_id`,`pt`.`label` AS `parametro`,round(10 * (sum(`q`.`graded`) / sum(`iq`.`points`)),1) AS `grade` from ((((((((`exam_impro_ap` `a` join `exam_impro_ap_parameter` `p` on(`p`.`exam_impro_ap_id` = `a`.`id`)) join `exam_impro_ap_criteria` `c` on(`c`.`exam_impro_ap_parameter_id` = `p`.`id`)) join `exam_impro_ap_question` `q` on(`q`.`exam_impro_ap_criteria_id` = `c`.`id`)) join `exam_impro_question` `iq` on(`iq`.`id` = `q`.`exam_impro_question_id`)) join `estudiante` `e` on(`a`.`estudiante_id` = `e`.`id`)) join `exam_impro_type` `t` on(`a`.`exam_impro_type_id` = `t`.`id`)) join `exam_impro_parameter` `pt` on(`p`.`exam_impro_parameter_id` = `pt`.`id`)) join `maestro` `m` on(`p`.`maestro_id` = `m`.`id`)) group by `a`.`id`,`p`.`id`;

-- Dumping structure for view entities.exam_impro_calificacion_det
-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `exam_impro_calificacion_det`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `exam_impro_calificacion_det` AS select `a`.`fechaApplicacion` AS `fecha`,`a`.`id` AS `id`,`a`.`materia` AS `materia`,`t`.`label` AS `tipo`,concat(`e`.`nombre`,' ',`e`.`apellidoPaterno`,' ',`e`.`apellidoMaterno`) AS `estudiante`,`e`.`email` AS `email`,`c`.`exam_impro_ap_parameter_id` AS `exam_impro_ap_parameter_id`,concat(`m`.`nombre`,' ',`m`.`apellidoPaterno`,' ',`m`.`apellidoMaterno`) AS `maestro`,`pt`.`label` AS `parametro`,`iq`.`label` AS `question`,5 + `q`.`graded` * 5 AS `calificacion` from ((((((((`exam_impro_ap` `a` join `exam_impro_ap_parameter` `p` on(`p`.`exam_impro_ap_id` = `a`.`id`)) join `exam_impro_ap_criteria` `c` on(`c`.`exam_impro_ap_parameter_id` = `p`.`id`)) join `exam_impro_ap_question` `q` on(`q`.`exam_impro_ap_criteria_id` = `c`.`id`)) join `exam_impro_question` `iq` on(`iq`.`id` = `q`.`exam_impro_question_id`)) join `estudiante` `e` on(`a`.`estudiante_id` = `e`.`id`)) join `exam_impro_type` `t` on(`a`.`exam_impro_type_id` = `t`.`id`)) join `exam_impro_parameter` `pt` on(`p`.`exam_impro_parameter_id` = `pt`.`id`)) join `maestro` `m` on(`p`.`maestro_id` = `m`.`id`));

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

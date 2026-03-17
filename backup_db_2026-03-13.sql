-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: user_crud
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `article_deliveries`
--

DROP TABLE IF EXISTS `article_deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_deliveries` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `personnelId` varchar(50) DEFAULT NULL,
  `deliveryDate` date NOT NULL,
  `notes` text,
  `status` enum('active','voided') DEFAULT 'active',
  `signedDocument` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `personnelId` (`personnelId`),
  CONSTRAINT `article_deliveries_ibfk_1` FOREIGN KEY (`personnelId`) REFERENCES `personnel` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_deliveries`
--

LOCK TABLES `article_deliveries` WRITE;
/*!40000 ALTER TABLE `article_deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `article_deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_delivery_items`
--

DROP TABLE IF EXISTS `article_delivery_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_delivery_items` (
  `deliveryId` varchar(50) NOT NULL,
  `articleId` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  `size` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`deliveryId`,`articleId`),
  KEY `articleId` (`articleId`),
  CONSTRAINT `article_delivery_items_ibfk_1` FOREIGN KEY (`deliveryId`) REFERENCES `article_deliveries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `article_delivery_items_ibfk_2` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_delivery_items`
--

LOCK TABLES `article_delivery_items` WRITE;
/*!40000 ALTER TABLE `article_delivery_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `article_delivery_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `minStock` int DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `canRequestByStaff` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES ('botas','Botas de seguridad',NULL,'EPP',25000.00,15,0,1,0,'2026-03-13 03:45:45',1),('casco','Casco de seguridad',NULL,'EPP',5000.00,10,0,1,0,'2026-03-13 03:45:45',1),('chaleco','Chaleco reflectante',NULL,'EPP',3000.00,20,0,1,0,'2026-03-13 03:45:45',1),('guantes','Guantes de nitrilo',NULL,'EPP',1500.00,50,0,1,0,'2026-03-13 03:45:45',1),('lentes','Lentes de protección',NULL,'EPP',2000.00,30,0,1,0,'2026-03-13 03:45:45',1);
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_maintenance_history`
--

DROP TABLE IF EXISTS `asset_maintenance_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_maintenance_history` (
  `id` varchar(50) NOT NULL,
  `assetId` varchar(50) DEFAULT NULL,
  `folio` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `description` text,
  `technicianName` varchar(255) DEFAULT NULL,
  `cost` decimal(15,2) DEFAULT NULL,
  `observations` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `assetId` (`assetId`),
  CONSTRAINT `asset_maintenance_history_ibfk_1` FOREIGN KEY (`assetId`) REFERENCES `fixed_assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_maintenance_history`
--

LOCK TABLES `asset_maintenance_history` WRITE;
/*!40000 ALTER TABLE `asset_maintenance_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_maintenance_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banks`
--

DROP TABLE IF EXISTS `banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banks` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banks`
--

LOCK TABLES `banks` WRITE;
/*!40000 ALTER TABLE `banks` DISABLE KEYS */;
INSERT INTO `banks` VALUES ('banco-de-chile','Banco de Chile',0,'2026-03-13 03:45:45'),('banco-estado','Banco Estado',0,'2026-03-13 03:45:45'),('bci','BCI',0,'2026-03-13 03:45:45'),('itaú','Itaú',0,'2026-03-13 03:45:45'),('santander','Santander',0,'2026-03-13 03:45:45'),('scotiabank','Scotiabank',0,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `banks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camera_requests`
--

DROP TABLE IF EXISTS `camera_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camera_requests` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `residentName` varchar(255) DEFAULT NULL,
  `unitId` varchar(50) DEFAULT NULL,
  `cameraId` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','attended','rejected') DEFAULT 'pending',
  `adminNotes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `userId` (`userId`),
  KEY `unitId` (`unitId`),
  CONSTRAINT `camera_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `camera_requests_ibfk_2` FOREIGN KEY (`unitId`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camera_requests`
--

LOCK TABLES `camera_requests` WRITE;
/*!40000 ALTER TABLE `camera_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `camera_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cameras`
--

DROP TABLE IF EXISTS `cameras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cameras` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cameras`
--

LOCK TABLES `cameras` WRITE;
/*!40000 ALTER TABLE `cameras` DISABLE KEYS */;
/*!40000 ALTER TABLE `cameras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `type` enum('residencia','gastos','estado_cuenta','liquidacion') NOT NULL,
  `residentName` varchar(255) NOT NULL,
  `residentRut` varchar(30) NOT NULL,
  `residentAddress` text NOT NULL,
  `adminName` varchar(255) DEFAULT NULL,
  `condoName` varchar(255) DEFAULT NULL,
  `generatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `common_expense_payments`
--

DROP TABLE IF EXISTS `common_expense_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `common_expense_payments` (
  `id` varchar(50) NOT NULL,
  `departmentId` varchar(50) DEFAULT NULL,
  `periodMonth` int NOT NULL,
  `periodYear` int NOT NULL,
  `amountPaid` decimal(15,2) NOT NULL,
  `paymentDate` date NOT NULL,
  `status` enum('paid','pending','mora') DEFAULT 'pending',
  `paymentMethod` varchar(50) DEFAULT NULL,
  `receiptFolio` varchar(50) DEFAULT NULL,
  `evidenceImage` text,
  `notes` text,
  `isElectronic` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `common_expense_payments_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `common_expense_payments`
--

LOCK TABLES `common_expense_payments` WRITE;
/*!40000 ALTER TABLE `common_expense_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `common_expense_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `common_expense_rules`
--

DROP TABLE IF EXISTS `common_expense_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `common_expense_rules` (
  `id` varchar(50) NOT NULL,
  `unitTypeId` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `effectiveFrom` date NOT NULL,
  `description` text,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `unitTypeId` (`unitTypeId`),
  CONSTRAINT `common_expense_rules_ibfk_1` FOREIGN KEY (`unitTypeId`) REFERENCES `unit_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `common_expense_rules`
--

LOCK TABLES `common_expense_rules` WRITE;
/*!40000 ALTER TABLE `common_expense_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `common_expense_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `common_spaces`
--

DROP TABLE IF EXISTS `common_spaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `common_spaces` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `rentalValue` int DEFAULT '0',
  `durationHours` int DEFAULT '1',
  `conditions` text,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `common_spaces`
--

LOCK TABLES `common_spaces` WRITE;
/*!40000 ALTER TABLE `common_spaces` DISABLE KEYS */;
/*!40000 ALTER TABLE `common_spaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communication_history`
--

DROP TABLE IF EXISTS `communication_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communication_history` (
  `id` varchar(50) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `recipients` text NOT NULL,
  `senderId` varchar(50) DEFAULT NULL,
  `targetFilter` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communication_history`
--

LOCK TABLES `communication_history` WRITE;
/*!40000 ALTER TABLE `communication_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `communication_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communication_templates`
--

DROP TABLE IF EXISTS `communication_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communication_templates` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('general','arrears','emergency') DEFAULT 'general',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communication_templates`
--

LOCK TABLES `communication_templates` WRITE;
/*!40000 ALTER TABLE `communication_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `communication_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_expenses`
--

DROP TABLE IF EXISTS `community_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_expenses` (
  `id` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `category` enum('Sueldos','MantenciÃ³n','Seguros','Servicios BÃ¡sicos','AdministraciÃ³n','Otros','Reparaciones') NOT NULL,
  `date` date NOT NULL,
  `receiptUrl` text,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_expenses`
--

LOCK TABLES `community_expenses` WRITE;
/*!40000 ALTER TABLE `community_expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `community_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `condo_board`
--

DROP TABLE IF EXISTS `condo_board`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `condo_board` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `rut` varchar(20) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `position` varchar(255) DEFAULT NULL,
  `signatureImage` longtext,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `condo_board`
--

LOCK TABLES `condo_board` WRITE;
/*!40000 ALTER TABLE `condo_board` DISABLE KEYS */;
INSERT INTO `condo_board` VALUES ('dir-1','Roberto Pino','10.333.444-5','988887766',NULL,NULL,'Presidente',NULL,1,'2026-03-13 03:45:45'),('dir-2','Ana María','12.444.555-6','977776655',NULL,NULL,'Secretaria',NULL,1,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `condo_board` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractor_visits`
--

DROP TABLE IF EXISTS `contractor_visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractor_visits` (
  `id` varchar(50) NOT NULL,
  `contractorId` varchar(50) DEFAULT NULL,
  `visitorName` varchar(255) DEFAULT NULL,
  `visitorDni` varchar(20) DEFAULT NULL,
  `visitDate` date NOT NULL,
  `status` enum('active','finished') DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractor_visits`
--

LOCK TABLES `contractor_visits` WRITE;
/*!40000 ALTER TABLE `contractor_visits` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractor_visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractors`
--

DROP TABLE IF EXISTS `contractors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contractors` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `specialty` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `monthlyPaymentAmount` decimal(15,2) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `maintenanceFrequency` enum('monthly','half-yearly','annual','none') DEFAULT 'none',
  `lastMaintenanceDate` date DEFAULT NULL,
  `showToResidents` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractors`
--

LOCK TABLES `contractors` WRITE;
/*!40000 ALTER TABLE `contractors` DISABLE KEYS */;
/*!40000 ALTER TABLE `contractors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `correspondence`
--

DROP TABLE IF EXISTS `correspondence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `correspondence` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `departmentId` varchar(50) DEFAULT NULL,
  `towerId` varchar(50) DEFAULT NULL,
  `type` enum('package','letter','delivery','other') DEFAULT 'package',
  `addressee` varchar(255) NOT NULL,
  `receivedBy` varchar(255) DEFAULT NULL,
  `courier` varchar(255) DEFAULT NULL,
  `details` text,
  `evidenceImage` text,
  `status` enum('pending','received','notified','delivered','expected') DEFAULT 'pending',
  `receivedAt` timestamp NULL DEFAULT NULL,
  `deliveredAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `departmentId` (`departmentId`),
  KEY `towerId` (`towerId`),
  CONSTRAINT `correspondence_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `correspondence_ibfk_2` FOREIGN KEY (`towerId`) REFERENCES `towers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `correspondence`
--

LOCK TABLES `correspondence` WRITE;
/*!40000 ALTER TABLE `correspondence` DISABLE KEYS */;
/*!40000 ALTER TABLE `correspondence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `couriers`
--

DROP TABLE IF EXISTS `couriers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `couriers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `couriers`
--

LOCK TABLES `couriers` WRITE;
/*!40000 ALTER TABLE `couriers` DISABLE KEYS */;
/*!40000 ALTER TABLE `couriers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department_features`
--

DROP TABLE IF EXISTS `department_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_features` (
  `departmentId` varchar(50) NOT NULL,
  `featureId` varchar(50) NOT NULL,
  PRIMARY KEY (`departmentId`,`featureId`),
  KEY `featureId` (`featureId`),
  CONSTRAINT `department_features_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `department_features_ibfk_2` FOREIGN KEY (`featureId`) REFERENCES `unit_features_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department_features`
--

LOCK TABLES `department_features` WRITE;
/*!40000 ALTER TABLE `department_features` DISABLE KEYS */;
/*!40000 ALTER TABLE `department_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` varchar(50) NOT NULL,
  `towerId` varchar(50) DEFAULT NULL,
  `number` varchar(50) NOT NULL,
  `floor` int DEFAULT NULL,
  `unitTypeId` varchar(50) DEFAULT NULL,
  `propertyRole` varchar(100) DEFAULT NULL,
  `m2` decimal(10,2) DEFAULT NULL,
  `terrainM2` decimal(10,2) DEFAULT NULL,
  `value` decimal(15,2) DEFAULT NULL,
  `dormitorios` int DEFAULT NULL,
  `banos` int DEFAULT NULL,
  `estacionamientos` int DEFAULT NULL,
  `yearBuilt` int DEFAULT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  `publishType` enum('venta','arriendo') DEFAULT NULL,
  `image` longtext,
  `locationMapUrl` text,
  `waterClientId` varchar(100) DEFAULT NULL,
  `electricityClientId` varchar(100) DEFAULT NULL,
  `gasClientId` varchar(100) DEFAULT NULL,
  `ownerId` varchar(50) DEFAULT NULL,
  `residentId` varchar(50) DEFAULT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `towerId` (`towerId`),
  KEY `unitTypeId` (`unitTypeId`),
  KEY `ownerId` (`ownerId`),
  KEY `residentId` (`residentId`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`towerId`) REFERENCES `towers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `departments_ibfk_2` FOREIGN KEY (`unitTypeId`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `departments_ibfk_3` FOREIGN KEY (`ownerId`) REFERENCES `owners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `departments_ibfk_4` FOREIGN KEY (`residentId`) REFERENCES `residents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES ('auhi0z850','tprp575ub','101',NULL,'dept-std','',56.00,0.00,60000000.00,3,1,1,1999,0,'venta','data:image/png;base64,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','https://maps.app.goo.gl/oGJUE8DRFWZHByK16','','','',NULL,NULL,0,'2026-03-13 20:32:50'),('dept-1','tower-1','101',1,'dept-std','ROL-101',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-1','res-1',0,'2026-03-13 03:45:41'),('dept-10','tower-1','302',3,'dept-std','ROL-302',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-10','res-10',0,'2026-03-13 03:45:42'),('dept-11','tower-1','303',3,'dept-std','ROL-303',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-11','res-11',0,'2026-03-13 03:45:42'),('dept-12','tower-1','304',3,'dept-std','ROL-304',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-12','res-12',0,'2026-03-13 03:45:42'),('dept-13','tower-1','401',4,'dept-std','ROL-401',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-13','res-13',0,'2026-03-13 03:45:42'),('dept-14','tower-1','402',4,'dept-std','ROL-402',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-14','res-14',0,'2026-03-13 03:45:42'),('dept-15','tower-1','403',4,'dept-std','ROL-403',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-15','res-15',0,'2026-03-13 03:45:42'),('dept-16','tower-1','404',4,'dept-std','ROL-404',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-16','res-16',0,'2026-03-13 03:45:42'),('dept-17','tower-2','101',1,'dept-std','ROL-101',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-17','res-17',0,'2026-03-13 03:45:42'),('dept-18','tower-2','102',1,'dept-std','ROL-102',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-18','res-18',0,'2026-03-13 03:45:42'),('dept-19','tower-2','103',1,'dept-std','ROL-103',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-19','res-19',0,'2026-03-13 03:45:42'),('dept-2','tower-1','102',1,'dept-std','ROL-102',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-2','res-2',0,'2026-03-13 03:45:41'),('dept-20','tower-2','104',1,'dept-std','ROL-104',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-20','res-20',0,'2026-03-13 03:45:42'),('dept-21','tower-2','201',2,'dept-std','ROL-201',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-21','res-21',0,'2026-03-13 03:45:42'),('dept-22','tower-2','202',2,'dept-std','ROL-202',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-22','res-22',0,'2026-03-13 03:45:42'),('dept-23','tower-2','203',2,'dept-std','ROL-203',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-23','res-23',0,'2026-03-13 03:45:42'),('dept-24','tower-2','204',2,'dept-std','ROL-204',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-24','res-24',0,'2026-03-13 03:45:42'),('dept-25','tower-2','301',3,'dept-std','ROL-301',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-25','res-25',0,'2026-03-13 03:45:42'),('dept-26','tower-2','302',3,'dept-std','ROL-302',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-26','res-26',0,'2026-03-13 03:45:42'),('dept-27','tower-2','303',3,'dept-std','ROL-303',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-27','res-27',0,'2026-03-13 03:45:42'),('dept-28','tower-2','304',3,'dept-std','ROL-304',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-28','res-28',0,'2026-03-13 03:45:42'),('dept-29','tower-2','401',4,'dept-std','ROL-401',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-29','res-29',0,'2026-03-13 03:45:42'),('dept-3','tower-1','103',1,'dept-std','ROL-103',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-3','res-3',0,'2026-03-13 03:45:41'),('dept-30','tower-2','402',4,'dept-std','ROL-402',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-30','res-30',0,'2026-03-13 03:45:43'),('dept-31','tower-2','403',4,'dept-std','ROL-403',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-31','res-31',0,'2026-03-13 03:45:43'),('dept-32','tower-2','404',4,'dept-std','ROL-404',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-32','res-32',0,'2026-03-13 03:45:43'),('dept-33','tower-3','101',1,'dept-std','ROL-101',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-33','res-33',0,'2026-03-13 03:45:43'),('dept-34','tower-3','102',1,'dept-std','ROL-102',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-34','res-34',0,'2026-03-13 03:45:43'),('dept-35','tower-3','103',1,'dept-std','ROL-103',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-35','res-35',0,'2026-03-13 03:45:43'),('dept-36','tower-3','104',1,'dept-std','ROL-104',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-36','res-36',0,'2026-03-13 03:45:43'),('dept-37','tower-3','201',2,'dept-std','ROL-201',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-37','res-37',0,'2026-03-13 03:45:43'),('dept-38','tower-3','202',2,'dept-std','ROL-202',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-38','res-38',0,'2026-03-13 03:45:43'),('dept-39','tower-3','203',2,'dept-std','ROL-203',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-39','res-39',0,'2026-03-13 03:45:43'),('dept-4','tower-1','104',1,'dept-std','ROL-104',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-4','res-4',0,'2026-03-13 03:45:41'),('dept-40','tower-3','204',2,'dept-std','ROL-204',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-40','res-40',0,'2026-03-13 03:45:43'),('dept-41','tower-3','301',3,'dept-std','ROL-301',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-41','res-41',0,'2026-03-13 03:45:43'),('dept-42','tower-3','302',3,'dept-std','ROL-302',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-42','res-42',0,'2026-03-13 03:45:43'),('dept-43','tower-3','303',3,'dept-std','ROL-303',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-43','res-43',0,'2026-03-13 03:45:43'),('dept-44','tower-3','304',3,'dept-std','ROL-304',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-44','res-44',0,'2026-03-13 03:45:43'),('dept-45','tower-3','401',4,'dept-std','ROL-401',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-45','res-45',0,'2026-03-13 03:45:43'),('dept-46','tower-3','402',4,'dept-std','ROL-402',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-46','res-46',0,'2026-03-13 03:45:43'),('dept-47','tower-3','403',4,'dept-std','ROL-403',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-47','res-47',0,'2026-03-13 03:45:43'),('dept-48','tower-3','404',4,'dept-std','ROL-404',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-48','res-48',0,'2026-03-13 03:45:43'),('dept-49','tower-4','101',1,'dept-std','ROL-101',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-49','res-49',0,'2026-03-13 03:45:43'),('dept-5','tower-1','201',2,'dept-std','ROL-201',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-5','res-5',0,'2026-03-13 03:45:42'),('dept-50','tower-4','102',1,'dept-std','ROL-102',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-50','res-50',0,'2026-03-13 03:45:43'),('dept-51','tower-4','103',1,'dept-std','ROL-103',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-51','res-51',0,'2026-03-13 03:45:43'),('dept-52','tower-4','104',1,'dept-std','ROL-104',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-52','res-52',0,'2026-03-13 03:45:43'),('dept-53','tower-4','201',2,'dept-std','ROL-201',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-53','res-53',0,'2026-03-13 03:45:43'),('dept-54','tower-4','202',2,'dept-std','ROL-202',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-54','res-54',0,'2026-03-13 03:45:43'),('dept-55','tower-4','203',2,'dept-std','ROL-203',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-55','res-55',0,'2026-03-13 03:45:44'),('dept-56','tower-4','204',2,'dept-std','ROL-204',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-56','res-56',0,'2026-03-13 03:45:44'),('dept-57','tower-4','301',3,'dept-std','ROL-301',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-57','res-57',0,'2026-03-13 03:45:44'),('dept-58','tower-4','302',3,'dept-std','ROL-302',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-58','res-58',0,'2026-03-13 03:45:44'),('dept-59','tower-4','303',3,'dept-std','ROL-303',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-59','res-59',0,'2026-03-13 03:45:44'),('dept-6','tower-1','202',2,'dept-std','ROL-202',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-6','res-6',0,'2026-03-13 03:45:42'),('dept-60','tower-4','304',3,'dept-std','ROL-304',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-60','res-60',0,'2026-03-13 03:45:44'),('dept-61','tower-4','401',4,'dept-std','ROL-401',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-61','res-61',0,'2026-03-13 03:45:44'),('dept-62','tower-4','402',4,'dept-std','ROL-402',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-62','res-62',0,'2026-03-13 03:45:44'),('dept-63','tower-4','403',4,'dept-std','ROL-403',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-63','res-63',0,'2026-03-13 03:45:44'),('dept-64','tower-4','404',4,'dept-std','ROL-404',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-64','res-64',0,'2026-03-13 03:45:44'),('dept-65','tower-5','101',1,'dept-std','ROL-101',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-65',NULL,0,'2026-03-13 03:45:44'),('dept-66','tower-5','102',1,'dept-std','ROL-102',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-66',NULL,0,'2026-03-13 03:45:44'),('dept-67','tower-5','103',1,'dept-std','ROL-103',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-67',NULL,0,'2026-03-13 03:45:44'),('dept-68','tower-5','104',1,'dept-std','ROL-104',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-68',NULL,0,'2026-03-13 03:45:44'),('dept-69','tower-5','201',2,'dept-std','ROL-201',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-69',NULL,0,'2026-03-13 03:45:44'),('dept-7','tower-1','203',2,'dept-std','ROL-203',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-7','res-7',0,'2026-03-13 03:45:42'),('dept-70','tower-5','202',2,'dept-std','ROL-202',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-70',NULL,0,'2026-03-13 03:45:45'),('dept-71','tower-5','203',2,'dept-std','ROL-203',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-71',NULL,0,'2026-03-13 03:45:45'),('dept-72','tower-5','204',2,'dept-std','ROL-204',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-72',NULL,0,'2026-03-13 03:45:45'),('dept-73','tower-5','301',3,'dept-std','ROL-301',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-73',NULL,0,'2026-03-13 03:45:45'),('dept-74','tower-5','302',3,'dept-std','ROL-302',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-74',NULL,0,'2026-03-13 03:45:45'),('dept-75','tower-5','303',3,'dept-std','ROL-303',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-75',NULL,0,'2026-03-13 03:45:45'),('dept-76','tower-5','304',3,'dept-std','ROL-304',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-76',NULL,0,'2026-03-13 03:45:45'),('dept-77','tower-5','401',4,'dept-std','ROL-401',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-77',NULL,0,'2026-03-13 03:45:45'),('dept-78','tower-5','402',4,'dept-std','ROL-402',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-78',NULL,0,'2026-03-13 03:45:45'),('dept-79','tower-5','403',4,'dept-std','ROL-403',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-79',NULL,0,'2026-03-13 03:45:45'),('dept-8','tower-1','204',2,'dept-std','ROL-204',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-8','res-8',0,'2026-03-13 03:45:42'),('dept-80','tower-5','404',4,'dept-std','ROL-404',56.00,NULL,56000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-80',NULL,0,'2026-03-13 03:45:45'),('dept-9','tower-1','301',3,'dept-std','ROL-301',49.00,NULL,49000000.00,3,1,1,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-9','res-9',0,'2026-03-13 03:45:42'),('LC-1','tower-1','LC-1',1,'local-com','ROL-LC-1',30.00,NULL,45000000.00,0,1,0,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-LC-1','res-LC-1',0,'2026-03-13 03:45:45'),('LC-2','tower-1','LC-2',1,'local-com','ROL-LC-2',30.00,NULL,45000000.00,0,1,0,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-LC-2','res-LC-2',0,'2026-03-13 03:45:45'),('LC-3','tower-1','LC-3',1,'local-com','ROL-LC-3',60.00,NULL,90000000.00,0,1,0,2021,1,NULL,NULL,NULL,NULL,NULL,NULL,'owner-LC-3','res-LC-3',0,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergency_numbers`
--

DROP TABLE IF EXISTS `emergency_numbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergency_numbers` (
  `id` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `description` text,
  `webUrl` text,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergency_numbers`
--

LOCK TABLES `emergency_numbers` WRITE;
/*!40000 ALTER TABLE `emergency_numbers` DISABLE KEYS */;
INSERT INTO `emergency_numbers` VALUES ('131','SALUD','Ambulancia (SAMU)','131','Emergencia Médica',NULL,0,'2026-03-13 03:51:07'),('132','URGENCIA','Bomberos','132','Emergencia de Incendio / Rescate',NULL,0,'2026-03-13 03:51:07'),('133','URGENCIA','Carabineros','133','Emergencia Policial',NULL,0,'2026-03-13 03:51:07'),('134','URGENCIA','PDI','134','Investigaciones',NULL,0,'2026-03-13 03:51:07'),('1401','COMUNAL','Seguridad Ciudadana','1401','Patrullaje Municipal',NULL,0,'2026-03-13 03:51:07'),('aguas','SERVICIOS','Aguas Andinas','227312400','Emergencia Agua / Alcantarillado',NULL,0,'2026-03-13 03:51:07'),('em-1','URGENCIA','SAMU','131','AtenciÃ³n MÃ©dica de Urgencia',NULL,0,'2026-03-13 03:45:20'),('em-2','URGENCIA','Bomberos','132','Rescate e Incendios',NULL,0,'2026-03-13 03:45:20'),('em-3','URGENCIA','Carabineros','133','PolicÃ­a de Emergencia',NULL,0,'2026-03-13 03:45:20'),('em-4','URGENCIA','PDI','134','PolicÃ­a de Investigaciones',NULL,0,'2026-03-13 03:45:20'),('em-5','COMUNAL','Seguridad Municipal','1401','Paz Ciudadana',NULL,0,'2026-03-13 03:45:20'),('em-6','COMUNAL','Plan Cuadrante','999999999','Carabineros por Zona',NULL,0,'2026-03-13 03:45:20'),('em-7','SERVICIOS','ESVAL','600 600 6013','Suministro de Agua',NULL,0,'2026-03-13 03:45:20'),('em-8','SERVICIOS','Empresa ElÃ©ctrica','600 000 0000','Chilquinta / Enel',NULL,0,'2026-03-13 03:45:20'),('em-9','SERVICIOS','Empresa Gas','600 000 0001','Lipigas / Abastible / Gasco',NULL,0,'2026-03-13 03:45:20'),('enel','SERVICIOS','Enel (Luz)','6006960000','Emergencia Eléctrica',NULL,0,'2026-03-13 03:51:07');
/*!40000 ALTER TABLE `emergency_numbers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_advances`
--

DROP TABLE IF EXISTS `employee_advances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_advances` (
  `id` varchar(50) NOT NULL,
  `personnelId` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `description` text,
  `status` enum('pending','deducted','cancelled') DEFAULT 'pending',
  `payslipId` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `personnelId` (`personnelId`),
  CONSTRAINT `employee_advances_ibfk_1` FOREIGN KEY (`personnelId`) REFERENCES `personnel` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_advances`
--

LOCK TABLES `employee_advances` WRITE;
/*!40000 ALTER TABLE `employee_advances` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_advances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment_items`
--

DROP TABLE IF EXISTS `equipment_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment_items` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isMandatory` tinyint(1) DEFAULT '0',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment_items`
--

LOCK TABLES `equipment_items` WRITE;
/*!40000 ALTER TABLE `equipment_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipment_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fixed_assets`
--

DROP TABLE IF EXISTS `fixed_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fixed_assets` (
  `id` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `quantity` int DEFAULT '1',
  `purchasePrice` decimal(15,2) DEFAULT '0.00',
  `depreciatedValue` decimal(15,2) DEFAULT '0.00',
  `model` varchar(255) DEFAULT NULL,
  `details` text,
  `isActive` tinyint(1) DEFAULT '1',
  `image` text,
  `purchaseDate` date DEFAULT NULL,
  `requiresMaintenance` tinyint(1) DEFAULT '0',
  `nextMaintenanceDate` date DEFAULT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fixed_assets`
--

LOCK TABLES `fixed_assets` WRITE;
/*!40000 ALTER TABLE `fixed_assets` DISABLE KEYS */;
INSERT INTO `fixed_assets` VALUES ('arbustos','Cortadora de arbustos',1,150000.00,0.00,'Stihl','Jardinería',1,NULL,NULL,0,NULL,0,'2026-03-13 03:45:45'),('ext-5','5 Extintores',5,250000.00,0.00,'ABC 6kg','Vencimiento julio 2026',1,NULL,NULL,0,'2026-07-01',0,'2026-03-13 03:45:45'),('gen','Generador eléctrico',1,1500000.00,0.00,'Honda','Respaldo emergencia',1,NULL,NULL,0,NULL,0,'2026-03-13 03:45:45'),('hp-aio','Computador HP All-in-One',1,800000.00,0.00,'24-df000','Conserjería',1,NULL,NULL,0,NULL,0,'2026-03-13 03:45:45'),('mon-15','2 monitores 15\" conserjería',2,100000.00,0.00,'Dell','Auxiliares',1,NULL,NULL,0,NULL,0,'2026-03-13 03:45:45'),('pc-i5','PC escritorio i5 20GB RAM',1,650000.00,0.00,'Custom','Administración',1,NULL,NULL,0,NULL,0,'2026-03-13 03:45:45'),('scaf','4 Juegos de andamios',4,400000.00,0.00,'Tubular','Estado oxidado, sin mantención',1,NULL,NULL,1,NULL,0,'2026-03-13 03:45:45'),('tv-50','TV 50\" monitoreo cámaras',1,350000.00,0.00,'Samsung 4K','Acceso Central',1,NULL,NULL,0,NULL,0,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `fixed_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_providers`
--

DROP TABLE IF EXISTS `health_providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `health_providers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('fonasa','isapre') NOT NULL,
  `discountRate` decimal(5,2) DEFAULT '0.00',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_providers`
--

LOCK TABLES `health_providers` WRITE;
/*!40000 ALTER TABLE `health_providers` DISABLE KEYS */;
INSERT INTO `health_providers` VALUES ('banmedica','Banmédica','isapre',7.00,0,'2026-03-13 03:45:45'),('colmena','Colmena','isapre',7.00,0,'2026-03-13 03:45:45'),('consalud','Consalud','isapre',7.00,0,'2026-03-13 03:45:45'),('fonasa','FONASA','fonasa',7.00,0,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `health_providers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history_logs`
--

DROP TABLE IF EXISTS `history_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history_logs` (
  `id` varchar(50) NOT NULL,
  `entityType` enum('department','owner','resident','personnel','reservation') NOT NULL,
  `entityId` varchar(50) NOT NULL,
  `unitId` varchar(50) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `details` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_logs`
--

LOCK TABLES `history_logs` WRITE;
/*!40000 ALTER TABLE `history_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `history_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `infrastructure_items`
--

DROP TABLE IF EXISTS `infrastructure_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `infrastructure_items` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isMandatory` tinyint(1) DEFAULT '0',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `infrastructure_items`
--

LOCK TABLES `infrastructure_items` WRITE;
/*!40000 ALTER TABLE `infrastructure_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `infrastructure_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ipc_projections`
--

DROP TABLE IF EXISTS `ipc_projections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ipc_projections` (
  `id` varchar(50) NOT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `value` decimal(10,4) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ipc_projections`
--

LOCK TABLES `ipc_projections` WRITE;
/*!40000 ALTER TABLE `ipc_projections` DISABLE KEYS */;
/*!40000 ALTER TABLE `ipc_projections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jornada_groups`
--

DROP TABLE IF EXISTS `jornada_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jornada_groups` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `workDays` text,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jornada_groups`
--

LOCK TABLES `jornada_groups` WRITE;
/*!40000 ALTER TABLE `jornada_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `jornada_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owners`
--

DROP TABLE IF EXISTS `owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owners` (
  `id` varchar(50) NOT NULL,
  `names` varchar(255) NOT NULL,
  `lastNames` varchar(255) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `notes` text,
  `status` varchar(20) DEFAULT 'active',
  `receiveResidentNotifications` tinyint(1) DEFAULT '0',
  `canResidentSeeArrears` tinyint(1) DEFAULT '0',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owners`
--

LOCK TABLES `owners` WRITE;
/*!40000 ALTER TABLE `owners` DISABLE KEYS */;
INSERT INTO `owners` VALUES ('owner-1','Propietario','101','1000-K',NULL,'owner1@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:41'),('owner-10','Propietario','302','10000-K',NULL,'owner10@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-11','Propietario','303','11000-K',NULL,'owner11@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-12','Propietario','304','12000-K',NULL,'owner12@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-13','Propietario','401','13000-K',NULL,'owner13@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-14','Propietario','402','14000-K',NULL,'owner14@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-15','Propietario','403','15000-K',NULL,'owner15@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-16','Propietario','404','16000-K',NULL,'owner16@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-17','Propietario','101','17000-K',NULL,'owner17@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-18','Propietario','102','18000-K',NULL,'owner18@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-19','Propietario','103','19000-K',NULL,'owner19@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-2','Propietario','102','2000-K',NULL,'owner2@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:41'),('owner-20','Propietario','104','20000-K',NULL,'owner20@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-21','Propietario','201','21000-K',NULL,'owner21@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-22','Propietario','202','22000-K',NULL,'owner22@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-23','Propietario','203','23000-K',NULL,'owner23@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-24','Propietario','204','24000-K',NULL,'owner24@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-25','Propietario','301','25000-K',NULL,'owner25@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-26','Propietario','302','26000-K',NULL,'owner26@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-27','Propietario','303','27000-K',NULL,'owner27@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-28','Propietario','304','28000-K',NULL,'owner28@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-29','Propietario','401','29000-K',NULL,'owner29@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-3','Propietario','103','3000-K',NULL,'owner3@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:41'),('owner-30','Propietario','402','30000-K',NULL,'owner30@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-31','Propietario','403','31000-K',NULL,'owner31@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-32','Propietario','404','32000-K',NULL,'owner32@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-33','Propietario','101','33000-K',NULL,'owner33@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-34','Propietario','102','34000-K',NULL,'owner34@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-35','Propietario','103','35000-K',NULL,'owner35@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-36','Propietario','104','36000-K',NULL,'owner36@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-37','Propietario','201','37000-K',NULL,'owner37@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-38','Propietario','202','38000-K',NULL,'owner38@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-39','Propietario','203','39000-K',NULL,'owner39@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-4','Propietario','104','4000-K',NULL,'owner4@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:41'),('owner-40','Propietario','204','40000-K',NULL,'owner40@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-41','Propietario','301','41000-K',NULL,'owner41@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-42','Propietario','302','42000-K',NULL,'owner42@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-43','Propietario','303','43000-K',NULL,'owner43@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-44','Propietario','304','44000-K',NULL,'owner44@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-45','Propietario','401','45000-K',NULL,'owner45@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-46','Propietario','402','46000-K',NULL,'owner46@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-47','Propietario','403','47000-K',NULL,'owner47@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-48','Propietario','404','48000-K',NULL,'owner48@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-49','Propietario','101','49000-K',NULL,'owner49@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-5','Propietario','201','5000-K',NULL,'owner5@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:41'),('owner-50','Propietario','102','50000-K',NULL,'owner50@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-51','Propietario','103','51000-K',NULL,'owner51@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-52','Propietario','104','52000-K',NULL,'owner52@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-53','Propietario','201','53000-K',NULL,'owner53@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-54','Propietario','202','54000-K',NULL,'owner54@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:43'),('owner-55','Propietario','203','55000-K',NULL,'owner55@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-56','Propietario','204','56000-K',NULL,'owner56@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-57','Propietario','301','57000-K',NULL,'owner57@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-58','Propietario','302','58000-K',NULL,'owner58@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-59','Propietario','303','59000-K',NULL,'owner59@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-6','Propietario','202','6000-K',NULL,'owner6@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-60','Propietario','304','60000-K',NULL,'owner60@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-61','Propietario','401','61000-K',NULL,'owner61@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-62','Propietario','402','62000-K',NULL,'owner62@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-63','Propietario','403','63000-K',NULL,'owner63@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-64','Propietario','404','64000-K',NULL,'owner64@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-65','Propietario','101','65000-K',NULL,'owner65@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-66','Propietario','102','66000-K',NULL,'owner66@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-67','Propietario','103','67000-K',NULL,'owner67@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-68','Propietario','104','68000-K',NULL,'owner68@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-69','Propietario','201','69000-K',NULL,'owner69@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:44'),('owner-7','Propietario','203','7000-K',NULL,'owner7@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-70','Propietario','202','70000-K',NULL,'owner70@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-71','Propietario','203','71000-K',NULL,'owner71@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-72','Propietario','204','72000-K',NULL,'owner72@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-73','Propietario','301','73000-K',NULL,'owner73@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-74','Propietario','302','74000-K',NULL,'owner74@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-75','Propietario','303','75000-K',NULL,'owner75@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-76','Propietario','304','76000-K',NULL,'owner76@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-77','Propietario','401','77000-K',NULL,'owner77@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-78','Propietario','402','78000-K',NULL,'owner78@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-79','Propietario','403','79000-K',NULL,'owner79@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-8','Propietario','204','8000-K',NULL,'owner8@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-80','Propietario','404','80000-K',NULL,'owner80@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-9','Propietario','301','9000-K',NULL,'owner9@example.com',NULL,'active',0,0,0,'2026-03-13 03:45:42'),('owner-comm-global','Inmobiliaria','Locales','76.000.000-1',NULL,'administracion@inmobiliaria.com',NULL,'active',0,0,0,'2026-03-13 03:55:28'),('owner-LC-1','Dueño Comercial','LC-1','C-LC-1-DNI',NULL,'LC-1@owner.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-LC-2','Dueño Comercial','LC-2','C-LC-2-DNI',NULL,'LC-2@owner.com',NULL,'active',0,0,0,'2026-03-13 03:45:45'),('owner-LC-3','Dueño Comercial','LC-3','C-LC-3-DNI',NULL,'LC-3@owner.com',NULL,'active',0,0,0,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parking`
--

DROP TABLE IF EXISTS `parking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking` (
  `id` varchar(50) NOT NULL,
  `number` varchar(50) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `isHandicapped` tinyint(1) DEFAULT '0',
  `notes` text,
  `departmentId` varchar(50) DEFAULT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `parking_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking`
--

LOCK TABLES `parking` WRITE;
/*!40000 ALTER TABLE `parking` DISABLE KEYS */;
/*!40000 ALTER TABLE `parking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payslips`
--

DROP TABLE IF EXISTS `payslips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payslips` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `personnelId` varchar(50) DEFAULT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `baseSalary` decimal(15,2) NOT NULL,
  `grossSalary` decimal(15,2) NOT NULL,
  `healthDiscount` decimal(15,2) DEFAULT '0.00',
  `pensionDiscount` decimal(15,2) DEFAULT '0.00',
  `apvDiscount` decimal(15,2) DEFAULT '0.00',
  `insuranceDiscount` decimal(15,2) DEFAULT '0.00',
  `advancesDiscount` decimal(15,2) DEFAULT '0.00',
  `totalDeductions` decimal(15,2) DEFAULT '0.00',
  `netSalary` decimal(15,2) NOT NULL,
  `generatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `personnelId` (`personnelId`),
  CONSTRAINT `payslips_ibfk_1` FOREIGN KEY (`personnelId`) REFERENCES `personnel` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payslips`
--

LOCK TABLES `payslips` WRITE;
/*!40000 ALTER TABLE `payslips` DISABLE KEYS */;
/*!40000 ALTER TABLE `payslips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pension_funds`
--

DROP TABLE IF EXISTS `pension_funds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pension_funds` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `discountRate` decimal(5,2) DEFAULT '0.00',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pension_funds`
--

LOCK TABLES `pension_funds` WRITE;
/*!40000 ALTER TABLE `pension_funds` DISABLE KEYS */;
INSERT INTO `pension_funds` VALUES ('capital','Capital',10.50,0,'2026-03-13 03:45:45'),('cuprum','Cuprum',10.50,0,'2026-03-13 03:45:45'),('habitat','Habitat',10.50,0,'2026-03-13 03:45:45'),('modelo','Modelo',10.50,0,'2026-03-13 03:45:45'),('planvital','PlanVital',10.50,0,'2026-03-13 03:45:45'),('provida','Provida',10.50,0,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `pension_funds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personnel`
--

DROP TABLE IF EXISTS `personnel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personnel` (
  `id` varchar(50) NOT NULL,
  `names` varchar(255) NOT NULL,
  `lastNames` varchar(255) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `photo` text,
  `isHonorary` tinyint(1) DEFAULT '0',
  `baseSalary` decimal(15,2) DEFAULT '0.00',
  `vacationDays` decimal(10,2) DEFAULT '0.00',
  `address` text,
  `position` varchar(255) DEFAULT NULL,
  `assignedShift` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `isArchived` tinyint(1) DEFAULT '0',
  `vacationLastUpdate` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personnel`
--

LOCK TABLES `personnel` WRITE;
/*!40000 ALTER TABLE `personnel` DISABLE KEYS */;
INSERT INTO `personnel` VALUES ('w-admin','Marta','Admin','w-admin-dni',NULL,NULL,NULL,0,0.00,0.00,NULL,'Administrador','Mañana','active',0,NULL,'2026-03-13 03:45:45'),('w-aft','Pedro','Tarde','w-aft-dni',NULL,NULL,NULL,0,0.00,0.00,NULL,'Conserje','Tarde','active',0,NULL,'2026-03-13 03:45:45'),('w-day','Juan','Día','w-day-dni',NULL,NULL,NULL,0,0.00,0.00,NULL,'Conserje','Mañana','active',0,NULL,'2026-03-13 03:45:45'),('w-night','Luis','Noche','w-night-dni',NULL,NULL,NULL,0,0.00,0.00,NULL,'Conserje','Noche','active',0,NULL,'2026-03-13 03:45:45'),('w-sun','Diego','Domingo','w-sun-dni',NULL,NULL,NULL,0,0.00,0.00,NULL,'Remplazo','Mañana','active',0,NULL,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `personnel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile_permissions`
--

DROP TABLE IF EXISTS `profile_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile_permissions` (
  `profileId` varchar(50) NOT NULL,
  `canViewPersonnel` tinyint(1) DEFAULT '0',
  `canManagePersonnel` tinyint(1) DEFAULT '0',
  `canViewPrevisiones` tinyint(1) DEFAULT '0',
  `canManagePrevisiones` tinyint(1) DEFAULT '0',
  `canViewAFPs` tinyint(1) DEFAULT '0',
  `canManageAFPs` tinyint(1) DEFAULT '0',
  `canViewUsers` tinyint(1) DEFAULT '0',
  `canManageUsers` tinyint(1) DEFAULT '0',
  `canViewProfiles` tinyint(1) DEFAULT '0',
  `canManageProfiles` tinyint(1) DEFAULT '0',
  `canViewSettings` tinyint(1) DEFAULT '0',
  `canManageSettings` tinyint(1) DEFAULT '0',
  `canViewInfrastructure` tinyint(1) DEFAULT '0',
  `canManageInfrastructure` tinyint(1) DEFAULT '0',
  `canViewResidents` tinyint(1) DEFAULT '0',
  `canManageResidents` tinyint(1) DEFAULT '0',
  `canViewOwners` tinyint(1) DEFAULT '0',
  `canManageOwners` tinyint(1) DEFAULT '0',
  `canViewUnitTypes` tinyint(1) DEFAULT '0',
  `canManageUnitTypes` tinyint(1) DEFAULT '0',
  `canViewParking` tinyint(1) DEFAULT '0',
  `canManageParking` tinyint(1) DEFAULT '0',
  `canViewCommonSpaces` tinyint(1) DEFAULT '0',
  `canManageCommonSpaces` tinyint(1) DEFAULT '0',
  `canViewArticles` tinyint(1) DEFAULT '0',
  `canManageArticles` tinyint(1) DEFAULT '0',
  `canViewContractors` tinyint(1) DEFAULT '0',
  `canManageContractors` tinyint(1) DEFAULT '0',
  `canViewFixedAssets` tinyint(1) DEFAULT '0',
  `canManageFixedAssets` tinyint(1) DEFAULT '0',
  `canViewEmergencyNumbers` tinyint(1) DEFAULT '0',
  `canManageEmergencyNumbers` tinyint(1) DEFAULT '0',
  `canViewOperationalMasters` tinyint(1) DEFAULT '0',
  `canManageOperationalMasters` tinyint(1) DEFAULT '0',
  `canViewCommonExpenses` tinyint(1) DEFAULT '0',
  `canManageCommonExpenses` tinyint(1) DEFAULT '0',
  `canViewCertificates` tinyint(1) DEFAULT '0',
  `canManageCertificates` tinyint(1) DEFAULT '0',
  `canViewVisitors` tinyint(1) DEFAULT '0',
  `canManageVisitors` tinyint(1) DEFAULT '0',
  `canViewShiftReports` tinyint(1) DEFAULT '0',
  `canManageShiftReports` tinyint(1) DEFAULT '0',
  `canViewCorrespondence` tinyint(1) DEFAULT '0',
  `canManageCorrespondence` tinyint(1) DEFAULT '0',
  `canViewTickets` tinyint(1) DEFAULT '0',
  `canManageTickets` tinyint(1) DEFAULT '0',
  `canViewCameraRequests` tinyint(1) DEFAULT '0',
  `canManageCameraRequests` tinyint(1) DEFAULT '0',
  `canViewReservations` tinyint(1) DEFAULT '0',
  `canManageReservations` tinyint(1) DEFAULT '0',
  `canViewSystemMessages` tinyint(1) DEFAULT '0',
  `canManageSystemMessages` tinyint(1) DEFAULT '0',
  `canViewArticleDeliveries` tinyint(1) DEFAULT '0',
  `canManageArticleDeliveries` tinyint(1) DEFAULT '0',
  `canViewPayslips` tinyint(1) DEFAULT '0',
  `canManagePayslips` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`profileId`),
  CONSTRAINT `profile_permissions_ibfk_1` FOREIGN KEY (`profileId`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile_permissions`
--

LOCK TABLES `profile_permissions` WRITE;
/*!40000 ALTER TABLE `profile_permissions` DISABLE KEYS */;
INSERT INTO `profile_permissions` VALUES ('admin-profile',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1),('administrador',1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),('propietario',0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),('residente',0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),('trabajador',0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
/*!40000 ALTER TABLE `profile_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES ('admin-profile','Administrador Global',0,'2026-03-13 21:11:04'),('administrador','Administrador',0,'2026-03-13 03:45:41'),('propietario','Propietario',0,'2026-03-13 03:45:41'),('residente','Residente',0,'2026-03-13 03:45:41'),('trabajador','Trabajador',0,'2026-03-13 03:45:40');
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `spaceId` varchar(50) DEFAULT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `unitId` varchar(50) DEFAULT NULL,
  `towerId` varchar(50) DEFAULT NULL,
  `date` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `paymentStatus` enum('pending','paid') DEFAULT 'pending',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residents`
--

DROP TABLE IF EXISTS `residents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `residents` (
  `id` varchar(50) NOT NULL,
  `names` varchar(255) NOT NULL,
  `lastNames` varchar(255) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `photo` text,
  `familyCount` int DEFAULT '0',
  `hasPets` tinyint(1) DEFAULT '0',
  `notes` text,
  `isTenant` tinyint(1) DEFAULT '0',
  `rentAmount` decimal(15,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residents`
--

LOCK TABLES `residents` WRITE;
/*!40000 ALTER TABLE `residents` DISABLE KEYS */;
INSERT INTO `residents` VALUES ('res-1','Residente','101','1111-K',NULL,'res1@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:41'),('res-10','Residente','302','10111-K',NULL,'res10@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-11','Residente','303','11111-K',NULL,'res11@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-12','Residente','304','12111-K',NULL,'res12@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-13','Residente','401','13111-K',NULL,'res13@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-14','Residente','402','14111-K',NULL,'res14@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-15','Residente','403','15111-K',NULL,'res15@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-16','Residente','404','16111-K',NULL,'res16@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-17','Residente','101','17111-K',NULL,'res17@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-18','Residente','102','18111-K',NULL,'res18@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-19','Residente','103','19111-K',NULL,'res19@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-2','Residente','102','2111-K',NULL,'res2@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:41'),('res-20','Residente','104','20111-K',NULL,'res20@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-21','Residente','201','21111-K',NULL,'res21@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-22','Residente','202','22111-K',NULL,'res22@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-23','Residente','203','23111-K',NULL,'res23@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-24','Residente','204','24111-K',NULL,'res24@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-25','Residente','301','25111-K',NULL,'res25@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-26','Residente','302','26111-K',NULL,'res26@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-27','Residente','303','27111-K',NULL,'res27@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-28','Residente','304','28111-K',NULL,'res28@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-29','Residente','401','29111-K',NULL,'res29@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-3','Residente','103','3111-K',NULL,'res3@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:41'),('res-30','Residente','402','30111-K',NULL,'res30@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-31','Residente','403','31111-K',NULL,'res31@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-32','Residente','404','32111-K',NULL,'res32@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-33','Residente','101','33111-K',NULL,'res33@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-34','Residente','102','34111-K',NULL,'res34@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-35','Residente','103','35111-K',NULL,'res35@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-36','Residente','104','36111-K',NULL,'res36@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-37','Residente','201','37111-K',NULL,'res37@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-38','Residente','202','38111-K',NULL,'res38@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-39','Residente','203','39111-K',NULL,'res39@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-4','Residente','104','4111-K',NULL,'res4@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:41'),('res-40','Residente','204','40111-K',NULL,'res40@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-41','Residente','301','41111-K',NULL,'res41@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-42','Residente','302','42111-K',NULL,'res42@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-43','Residente','303','43111-K',NULL,'res43@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-44','Residente','304','44111-K',NULL,'res44@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-45','Residente','401','45111-K',NULL,'res45@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-46','Residente','402','46111-K',NULL,'res46@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-47','Residente','403','47111-K',NULL,'res47@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-48','Residente','404','48111-K',NULL,'res48@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-49','Residente','101','49111-K',NULL,'res49@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-5','Residente','201','5111-K',NULL,'res5@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-50','Residente','102','50111-K',NULL,'res50@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-51','Residente','103','51111-K',NULL,'res51@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-52','Residente','104','52111-K',NULL,'res52@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-53','Residente','201','53111-K',NULL,'res53@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-54','Residente','202','54111-K',NULL,'res54@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:43'),('res-55','Residente','203','55111-K',NULL,'res55@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-56','Residente','204','56111-K',NULL,'res56@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-57','Residente','301','57111-K',NULL,'res57@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-58','Residente','302','58111-K',NULL,'res58@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-59','Residente','303','59111-K',NULL,'res59@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-6','Residente','202','6111-K',NULL,'res6@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-60','Residente','304','60111-K',NULL,'res60@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-61','Residente','401','61111-K',NULL,'res61@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-62','Residente','402','62111-K',NULL,'res62@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-63','Residente','403','63111-K',NULL,'res63@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-64','Residente','404','64111-K',NULL,'res64@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:44'),('res-7','Residente','203','7111-K',NULL,'res7@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-8','Residente','204','8111-K',NULL,'res8@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-9','Residente','301','9111-K',NULL,'res9@example.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:42'),('res-LC-1','Locatario','LC-1','C-LC-1-RES-DNI',NULL,'LC-1@res.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:45'),('res-LC-2','Locatario','LC-2','C-LC-2-RES-DNI',NULL,'LC-2@res.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:45'),('res-LC-3','Locatario','LC-3','C-LC-3-RES-DNI',NULL,'LC-3@res.com',NULL,0,0,NULL,0,NULL,'active',0,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `residents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shift_reports`
--

DROP TABLE IF EXISTS `shift_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shift_reports` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `workerId` varchar(50) DEFAULT NULL,
  `workerName` varchar(255) DEFAULT NULL,
  `shiftDate` date NOT NULL,
  `shiftType` enum('Manana','Tarde','Noche') NOT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `novedades` text,
  `hasIncidents` tinyint(1) DEFAULT '0',
  `incidentDetails` text,
  `hasInfrastructureIssues` tinyint(1) DEFAULT '0',
  `infrastructureIssueDetails` text,
  `hasEquipmentIssues` tinyint(1) DEFAULT '0',
  `equipmentIssueDetails` text,
  `closedAt` timestamp NULL DEFAULT NULL,
  `adminReopenReason` text,
  `adminReopenedBy` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `workerId` (`workerId`),
  CONSTRAINT `shift_reports_ibfk_1` FOREIGN KEY (`workerId`) REFERENCES `personnel` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shift_reports`
--

LOCK TABLES `shift_reports` WRITE;
/*!40000 ALTER TABLE `shift_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `shift_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `special_conditions`
--

DROP TABLE IF EXISTS `special_conditions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `special_conditions` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `special_conditions`
--

LOCK TABLES `special_conditions` WRITE;
/*!40000 ALTER TABLE `special_conditions` DISABLE KEYS */;
/*!40000 ALTER TABLE `special_conditions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `special_funds`
--

DROP TABLE IF EXISTS `special_funds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `special_funds` (
  `id` varchar(50) NOT NULL,
  `fundCode` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('reserve','extraordinary') NOT NULL,
  `description` text,
  `totalAmountPerUnit` decimal(15,2) DEFAULT '0.00',
  `totalProjectAmount` decimal(15,2) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `deadline` date DEFAULT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fundCode` (`fundCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `special_funds`
--

LOCK TABLES `special_funds` WRITE;
/*!40000 ALTER TABLE `special_funds` DISABLE KEYS */;
/*!40000 ALTER TABLE `special_funds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_messages`
--

DROP TABLE IF EXISTS `system_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_messages` (
  `id` varchar(50) NOT NULL,
  `text` text NOT NULL,
  `type` enum('info','warning','danger','success') DEFAULT 'info',
  `isActive` tinyint(1) DEFAULT '1',
  `image` text,
  `youtubeUrl` text,
  `durationSeconds` int DEFAULT NULL,
  `expiresAt` timestamp NULL DEFAULT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_messages`
--

LOCK TABLES `system_messages` WRITE;
/*!40000 ALTER TABLE `system_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_parameters`
--

DROP TABLE IF EXISTS `system_parameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_parameters` (
  `id` varchar(50) NOT NULL,
  `type` enum('job_position','shift','contractor_specialty','ticket_category','article_category','pet_type','vehicle_type') NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_parameters`
--

LOCK TABLES `system_parameters` WRITE;
/*!40000 ALTER TABLE `system_parameters` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_parameters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL DEFAULT '1',
  `systemName` varchar(255) DEFAULT 'SGC',
  `systemIcon` text,
  `systemLogo` text,
  `systemFavicon` text,
  `cameraBackupDays` int DEFAULT '30',
  `theme` varchar(20) DEFAULT 'light',
  `adminName` varchar(255) DEFAULT NULL,
  `adminRut` varchar(20) DEFAULT NULL,
  `condoRut` varchar(20) DEFAULT NULL,
  `condoAddress` text,
  `adminPhone` varchar(50) DEFAULT NULL,
  `adminSignature` text,
  `deletionPassword` varchar(255) DEFAULT NULL,
  `vacationAccrualRate` decimal(5,2) DEFAULT '1.25',
  `paymentDeadlineDay` int DEFAULT '5',
  `maxArrearsMonths` int DEFAULT '3',
  `arrearsFineAmount` decimal(15,2) DEFAULT '0.00',
  `arrearsFinePercentage` decimal(5,2) DEFAULT '0.00',
  `smtpHost` varchar(255) DEFAULT NULL,
  `smtpPort` int DEFAULT NULL,
  `smtpUser` varchar(255) DEFAULT NULL,
  `smtpPassword` varchar(255) DEFAULT NULL,
  `smtpFrom` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `system_settings_chk_1` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'SGC - Sistema de GestiÃ³n de Condominios',NULL,NULL,NULL,30,'light','Marta Administración','15.222.333-4','76.111.222-K','Av. Principal 1234','+56 9 1234 5678',NULL,NULL,1.25,5,3,0.00,0.00,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `unitId` varchar(50) DEFAULT NULL,
  `towerId` varchar(50) DEFAULT NULL,
  `type` enum('complaint','suggestion','visit_registration','reservation','provision_request','shift_report','incident') NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` text,
  `status` enum('pending','read','attended','solved') DEFAULT 'pending',
  `adminNotes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `userId` (`userId`),
  KEY `unitId` (`unitId`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`unitId`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `towers`
--

DROP TABLE IF EXISTS `towers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `towers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `towers`
--

LOCK TABLES `towers` WRITE;
/*!40000 ALTER TABLE `towers` DISABLE KEYS */;
INSERT INTO `towers` VALUES ('tower-1','Torre A',0,'2026-03-13 03:45:41'),('tower-2','Torre B',0,'2026-03-13 03:45:41'),('tower-3','Torre C',0,'2026-03-13 03:45:41'),('tower-4','Torre D',0,'2026-03-13 03:45:41'),('tower-5','Torre E',0,'2026-03-13 03:45:41'),('tprp575ub','Torre Z',0,'2026-03-13 20:28:50');
/*!40000 ALTER TABLE `towers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_features_master`
--

DROP TABLE IF EXISTS `unit_features_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_features_master` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_features_master`
--

LOCK TABLES `unit_features_master` WRITE;
/*!40000 ALTER TABLE `unit_features_master` DISABLE KEYS */;
INSERT INTO `unit_features_master` VALUES ('accesos-controlados','Accesos controlados',1,'2026-03-13 03:45:45'),('áreas-verdes','Áreas verdes',1,'2026-03-13 03:45:45'),('bicicletero','Bicicletero',1,'2026-03-13 03:45:45'),('cámaras-de-seguridad','Cámaras de seguridad',1,'2026-03-13 03:45:45'),('estacionamiento-visitas','Estacionamiento visitas',1,'2026-03-13 03:45:45'),('portón-eléctrico','Portón eléctrico',1,'2026-03-13 03:45:45'),('quinchos','Quinchos',1,'2026-03-13 03:45:45');
/*!40000 ALTER TABLE `unit_features_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_publications`
--

DROP TABLE IF EXISTS `unit_publications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_publications` (
  `id` varchar(50) NOT NULL,
  `departmentId` varchar(50) DEFAULT NULL,
  `publishType` enum('venta','arriendo') NOT NULL,
  `status` enum('activo','pausado','vendido','arrendado') DEFAULT 'activo',
  `price` decimal(15,2) DEFAULT NULL,
  `publishDate` date NOT NULL,
  `description` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `unit_publications_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_publications`
--

LOCK TABLES `unit_publications` WRITE;
/*!40000 ALTER TABLE `unit_publications` DISABLE KEYS */;
INSERT INTO `unit_publications` VALUES ('pub-76','dept-76','venta','activo',84000000.00,'2026-03-13','Excelente departamento nuevo.','2026-03-13 03:55:28'),('pub-77','dept-77','venta','activo',73500000.00,'2026-03-13','Excelente departamento nuevo.','2026-03-13 03:55:28'),('pub-78','dept-78','venta','activo',84000000.00,'2026-03-13','Excelente departamento nuevo.','2026-03-13 03:55:28'),('pub-79','dept-79','venta','activo',73500000.00,'2026-03-13','Excelente departamento nuevo.','2026-03-13 03:55:28'),('pub-80','dept-80','venta','activo',84000000.00,'2026-03-13','Excelente departamento nuevo.','2026-03-13 03:55:28');
/*!40000 ALTER TABLE `unit_publications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_types`
--

DROP TABLE IF EXISTS `unit_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_types` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `baseCommonExpense` decimal(15,2) DEFAULT '0.00',
  `defaultM2` decimal(10,2) DEFAULT NULL,
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_types`
--

LOCK TABLES `unit_types` WRITE;
/*!40000 ALTER TABLE `unit_types` DISABLE KEYS */;
INSERT INTO `unit_types` VALUES ('defqqr6t9','zxczxc',43214242.00,NULL,0,'2026-03-13 20:33:26'),('dept-std','Departamento Estándar',40000.00,56.00,0,'2026-03-13 03:45:41'),('local-com','Local Comercial',21429.00,30.00,0,'2026-03-13 03:45:41');
/*!40000 ALTER TABLE `unit_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `profileId` varchar(50) DEFAULT NULL,
  `relatedId` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `password` varchar(255) DEFAULT NULL,
  `mustChangePassword` tinyint(1) DEFAULT '0',
  `isArchived` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `profileId` (`profileId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`profileId`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('admin-1','Admin Total','admin@example.com','global_admin',NULL,NULL,'active',NULL,0,0,'2026-03-13 03:45:20');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitors`
--

DROP TABLE IF EXISTS `visitors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitors` (
  `id` varchar(50) NOT NULL,
  `folio` varchar(50) NOT NULL,
  `names` varchar(255) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `towerId` varchar(50) DEFAULT NULL,
  `departmentId` varchar(50) DEFAULT NULL,
  `visitDate` date NOT NULL,
  `visitTime` time DEFAULT NULL,
  `isPreRegistered` tinyint(1) DEFAULT '0',
  `status` enum('scheduled','entered','exited','cancelled') DEFAULT 'scheduled',
  `entryTime` varchar(20) DEFAULT NULL,
  `exitTime` varchar(20) DEFAULT NULL,
  `vehiclePlate` varchar(20) DEFAULT NULL,
  `notes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `towerId` (`towerId`),
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `visitors_ibfk_1` FOREIGN KEY (`towerId`) REFERENCES `towers` (`id`),
  CONSTRAINT `visitors_ibfk_2` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitors`
--

LOCK TABLES `visitors` WRITE;
/*!40000 ALTER TABLE `visitors` DISABLE KEYS */;
/*!40000 ALTER TABLE `visitors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weighted_ipc`
--

DROP TABLE IF EXISTS `weighted_ipc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weighted_ipc` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` decimal(10,4) NOT NULL,
  `isProjected` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weighted_ipc`
--

LOCK TABLES `weighted_ipc` WRITE;
/*!40000 ALTER TABLE `weighted_ipc` DISABLE KEYS */;
/*!40000 ALTER TABLE `weighted_ipc` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-13 23:12:01

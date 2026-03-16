CREATE DATABASE IF NOT EXISTS user_crud;
USE user_crud;

-- ==========================================
-- 1. BASE INFRASTRUCTURE & AUTH
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile_permissions (
    profileId VARCHAR(50) PRIMARY KEY,
    -- Configuration & Masters
    canViewPersonnel BOOLEAN DEFAULT FALSE,
    canManagePersonnel BOOLEAN DEFAULT FALSE,
    canViewPrevisiones BOOLEAN DEFAULT FALSE,
    canManagePrevisiones BOOLEAN DEFAULT FALSE,
    canViewAFPs BOOLEAN DEFAULT FALSE,
    canManageAFPs BOOLEAN DEFAULT FALSE,
    canViewUsers BOOLEAN DEFAULT FALSE,
    canManageUsers BOOLEAN DEFAULT FALSE,
    canViewProfiles BOOLEAN DEFAULT FALSE,
    canManageProfiles BOOLEAN DEFAULT FALSE,
    canViewSettings BOOLEAN DEFAULT FALSE,
    canManageSettings BOOLEAN DEFAULT FALSE,
    canViewInfrastructure BOOLEAN DEFAULT FALSE,
    canManageInfrastructure BOOLEAN DEFAULT FALSE,
    canViewResidents BOOLEAN DEFAULT FALSE,
    canManageResidents BOOLEAN DEFAULT FALSE,
    canViewOwners BOOLEAN DEFAULT FALSE,
    canManageOwners BOOLEAN DEFAULT FALSE,
    canViewUnitTypes BOOLEAN DEFAULT FALSE,
    canManageUnitTypes BOOLEAN DEFAULT FALSE,
    canViewParking BOOLEAN DEFAULT FALSE,
    canManageParking BOOLEAN DEFAULT FALSE,
    canViewCommonSpaces BOOLEAN DEFAULT FALSE,
    canManageCommonSpaces BOOLEAN DEFAULT FALSE,
    canViewArticles BOOLEAN DEFAULT FALSE,
    canManageArticles BOOLEAN DEFAULT FALSE,
    canViewContractors BOOLEAN DEFAULT FALSE,
    canManageContractors BOOLEAN DEFAULT FALSE,
    canViewFixedAssets BOOLEAN DEFAULT FALSE,
    canManageFixedAssets BOOLEAN DEFAULT FALSE,
    canViewEmergencyNumbers BOOLEAN DEFAULT FALSE,
    canManageEmergencyNumbers BOOLEAN DEFAULT FALSE,
    canViewOperationalMasters BOOLEAN DEFAULT FALSE,
    canManageOperationalMasters BOOLEAN DEFAULT FALSE,
    -- Operations & Management
    canViewCommonExpenses BOOLEAN DEFAULT FALSE,
    canManageCommonExpenses BOOLEAN DEFAULT FALSE,
    canViewCertificates BOOLEAN DEFAULT FALSE,
    canManageCertificates BOOLEAN DEFAULT FALSE,
    canViewVisitors BOOLEAN DEFAULT FALSE,
    canManageVisitors BOOLEAN DEFAULT FALSE,
    canViewShiftReports BOOLEAN DEFAULT FALSE,
    canManageShiftReports BOOLEAN DEFAULT FALSE,
    canViewCorrespondence BOOLEAN DEFAULT FALSE,
    canManageCorrespondence BOOLEAN DEFAULT FALSE,
    canViewTickets BOOLEAN DEFAULT FALSE,
    canManageTickets BOOLEAN DEFAULT FALSE,
    canViewCameraRequests BOOLEAN DEFAULT FALSE,
    canManageCameraRequests BOOLEAN DEFAULT FALSE,
    canViewReservations BOOLEAN DEFAULT FALSE,
    canManageReservations BOOLEAN DEFAULT FALSE,
    canViewSystemMessages BOOLEAN DEFAULT FALSE,
    canManageSystemMessages BOOLEAN DEFAULT FALSE,
    canViewArticleDeliveries BOOLEAN DEFAULT FALSE,
    canManageArticleDeliveries BOOLEAN DEFAULT FALSE,
    canViewPayslips BOOLEAN DEFAULT FALSE,
    canManagePayslips BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    profileId VARCHAR(50),
    relatedId VARCHAR(50), -- Link to Personnel or Resident
    status VARCHAR(50) DEFAULT 'active',
    password VARCHAR(255),
    mustChangePassword BOOLEAN DEFAULT FALSE,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS towers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unit_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    baseCommonExpense DECIMAL(15,2) DEFAULT 0,
    defaultM2 DECIMAL(10,2),
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS owners (
    id VARCHAR(50) PRIMARY KEY,
    names VARCHAR(255) NOT NULL,
    lastNames VARCHAR(255) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    receiveResidentNotifications BOOLEAN DEFAULT FALSE,
    canResidentSeeArrears BOOLEAN DEFAULT FALSE,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS residents (
    id VARCHAR(50) PRIMARY KEY,
    names VARCHAR(255) NOT NULL,
    lastNames VARCHAR(255) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    photo TEXT, -- Base64
    familyCount INT DEFAULT 0,
    hasPets BOOLEAN DEFAULT FALSE,
    notes TEXT,
    isTenant BOOLEAN DEFAULT FALSE,
    rentAmount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'active',
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    towerId VARCHAR(50),
    number VARCHAR(50) NOT NULL,
    floor INT,
    unitTypeId VARCHAR(50),
    propertyRole VARCHAR(100),
    m2 DECIMAL(10,2),
    terrainM2 DECIMAL(10,2),
    value DECIMAL(15,2),
    dormitorios INT,
    banos INT,
    estacionamientos INT,
    yearBuilt INT,
    isAvailable BOOLEAN DEFAULT TRUE,
    publishType ENUM('venta', 'arriendo'),
    image LONGTEXT, -- Base64
    locationMapUrl TEXT,
    waterClientId VARCHAR(100),
    electricityClientId VARCHAR(100),
    gasClientId VARCHAR(100),
    ownerId VARCHAR(50),
    residentId VARCHAR(50),
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (towerId) REFERENCES towers(id) ON DELETE CASCADE,
    FOREIGN KEY (unitTypeId) REFERENCES unit_types(id) ON DELETE SET NULL,
    FOREIGN KEY (ownerId) REFERENCES owners(id) ON DELETE SET NULL,
    FOREIGN KEY (residentId) REFERENCES residents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS unit_features_master (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS department_features (
    departmentId VARCHAR(50),
    featureId VARCHAR(50),
    PRIMARY KEY (departmentId, featureId),
    FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (featureId) REFERENCES unit_features_master(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unit_publications (
    id VARCHAR(50) PRIMARY KEY,
    departmentId VARCHAR(50),
    publishType ENUM('venta', 'arriendo') NOT NULL,
    status ENUM('activo', 'pausado', 'vendido', 'arrendado') DEFAULT 'activo',
    price DECIMAL(15,2),
    publishDate DATE NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parking (
    id VARCHAR(50) PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    isHandicapped BOOLEAN DEFAULT FALSE,
    notes TEXT,
    departmentId VARCHAR(50), -- Link parking to unit
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL
);

-- ==========================================
-- 2. SYSTEM CONFIGURATION
-- ==========================================

CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    systemName VARCHAR(255) DEFAULT 'SGC',
    systemIcon TEXT,
    systemLogo TEXT,
    systemFavicon TEXT,
    cameraBackupDays INT DEFAULT 30,
    theme VARCHAR(20) DEFAULT 'light',
    adminName VARCHAR(255),
    adminRut VARCHAR(20),
    condoRut VARCHAR(20),
    condoAddress TEXT,
    adminPhone VARCHAR(50),
    adminSignature TEXT,
    deletionPassword VARCHAR(255),
    vacationAccrualRate DECIMAL(5,2) DEFAULT 1.25,
    paymentDeadlineDay INT DEFAULT 5,
    maxArrearsMonths INT DEFAULT 3,
    arrearsFineAmount DECIMAL(15,2) DEFAULT 0,
    arrearsFinePercentage DECIMAL(5,2) DEFAULT 0,
    -- Email SMTP
    smtpHost VARCHAR(255),
    smtpPort INT,
    smtpUser VARCHAR(255),
    smtpPassword VARCHAR(255),
    smtpFrom VARCHAR(255),
    CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS system_parameters (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('job_position', 'shift', 'contractor_specialty', 'ticket_category', 'article_category', 'pet_type', 'vehicle_type') NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('fonasa', 'isapre') NOT NULL,
    discountRate DECIMAL(5,2) DEFAULT 0,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pension_funds (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    discountRate DECIMAL(5,2) DEFAULT 0,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS special_conditions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. SECURITY & CONCIERGE
-- ==========================================

CREATE TABLE IF NOT EXISTS personnel (
    id VARCHAR(50) PRIMARY KEY,
    names VARCHAR(255) NOT NULL,
    lastNames VARCHAR(255) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    photo TEXT,
    isHonorary BOOLEAN DEFAULT FALSE,
    baseSalary DECIMAL(15,2) DEFAULT 0,
    vacationDays DECIMAL(10,2) DEFAULT 0,
    address TEXT,
    position VARCHAR(255),
    assignedShift VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    isArchived BOOLEAN DEFAULT FALSE,
    vacationLastUpdate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shift_reports (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    workerId VARCHAR(50),
    workerName VARCHAR(255),
    shiftDate DATE NOT NULL,
    shiftType ENUM('Manana', 'Tarde', 'Noche') NOT NULL,
    status ENUM('open', 'closed') DEFAULT 'open',
    novedades TEXT,
    hasIncidents BOOLEAN DEFAULT FALSE,
    incidentDetails TEXT,
    hasInfrastructureIssues BOOLEAN DEFAULT FALSE,
    infrastructureIssueDetails TEXT,
    hasEquipmentIssues BOOLEAN DEFAULT FALSE,
    equipmentIssueDetails TEXT,
    closedAt TIMESTAMP NULL,
    adminReopenReason TEXT,
    adminReopenedBy VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workerId) REFERENCES personnel(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS visitors (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    names VARCHAR(255) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    towerId VARCHAR(50),
    departmentId VARCHAR(50),
    visitDate DATE NOT NULL,
    visitTime TIME,
    isPreRegistered BOOLEAN DEFAULT FALSE,
    status ENUM('scheduled', 'entered', 'exited', 'cancelled') DEFAULT 'scheduled',
    entryTime VARCHAR(20),
    exitTime VARCHAR(20),
    vehiclePlate VARCHAR(20),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (towerId) REFERENCES towers(id),
    FOREIGN KEY (departmentId) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS correspondence (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    departmentId VARCHAR(50),
    towerId VARCHAR(50),
    type ENUM('package', 'letter', 'delivery', 'other') DEFAULT 'package',
    addressee VARCHAR(255) NOT NULL,
    receivedBy VARCHAR(255), -- Name or Personnel ID
    courier VARCHAR(255),
    details TEXT,
    evidenceImage TEXT,
    status ENUM('pending', 'received', 'notified', 'delivered', 'expected') DEFAULT 'pending',
    receivedAt TIMESTAMP NULL,
    deliveredAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departmentId) REFERENCES departments(id),
    FOREIGN KEY (towerId) REFERENCES towers(id)
);

CREATE TABLE IF NOT EXISTS camera_requests (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    userId VARCHAR(50),
    residentName VARCHAR(255),
    unitId VARCHAR(50),
    cameraId VARCHAR(255),
    date DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'attended', 'rejected') DEFAULT 'pending',
    adminNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (unitId) REFERENCES departments(id)
);

-- ==========================================
-- 4. FINANCE (COMMON EXPENSES & PAYROLL)
-- ==========================================

CREATE TABLE IF NOT EXISTS special_funds (
    id VARCHAR(50) PRIMARY KEY,
    fundCode INT UNIQUE NOT NULL, -- 0=GC, 1, 2...
    name VARCHAR(255) NOT NULL,
    type ENUM('reserve', 'extraordinary') NOT NULL,
    description TEXT,
    totalAmountPerUnit DECIMAL(15,2) DEFAULT 0,
    totalProjectAmount DECIMAL(15,2),
    isActive BOOLEAN DEFAULT TRUE,
    deadline DATE,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common_expense_rules (
    id VARCHAR(50) PRIMARY KEY,
    unitTypeId VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    effectiveFrom DATE NOT NULL,
    description TEXT,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unitTypeId) REFERENCES unit_types(id)
);

CREATE TABLE IF NOT EXISTS common_expense_payments (
    id VARCHAR(50) PRIMARY KEY,
    departmentId VARCHAR(50),
    periodMonth INT NOT NULL,
    periodYear INT NOT NULL,
    amountPaid DECIMAL(15,2) NOT NULL,
    paymentDate DATE NOT NULL,
    status ENUM('paid', 'pending', 'mora') DEFAULT 'pending',
    paymentMethod VARCHAR(50),
    receiptFolio VARCHAR(50),
    evidenceImage TEXT,
    notes TEXT,
    isElectronic BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departmentId) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS community_expenses (
    id VARCHAR(50) PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category ENUM('Sueldos', 'Mantención', 'Seguros', 'Servicios Básicos', 'Administración', 'Otros', 'Reparaciones') NOT NULL,
    date DATE NOT NULL,
    receiptUrl TEXT,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_advances (
    id VARCHAR(50) PRIMARY KEY,
    personnelId VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    status ENUM('pending', 'deducted', 'cancelled') DEFAULT 'pending',
    payslipId VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personnelId) REFERENCES personnel(id)
);

CREATE TABLE IF NOT EXISTS payslips (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    personnelId VARCHAR(50),
    month INT NOT NULL,
    year INT NOT NULL,
    baseSalary DECIMAL(15,2) NOT NULL,
    grossSalary DECIMAL(15,2) NOT NULL,
    healthDiscount DECIMAL(15,2) DEFAULT 0,
    pensionDiscount DECIMAL(15,2) DEFAULT 0,
    apvDiscount DECIMAL(15,2) DEFAULT 0,
    insuranceDiscount DECIMAL(15,2) DEFAULT 0,
    advancesDiscount DECIMAL(15,2) DEFAULT 0,
    totalDeductions DECIMAL(15,2) DEFAULT 0,
    netSalary DECIMAL(15,2) NOT NULL,
    generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personnelId) REFERENCES personnel(id)
);

-- ==========================================
-- 5. MAINTENANCE & ASSETS
-- ==========================================

CREATE TABLE IF NOT EXISTS contractors (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    monthlyPaymentAmount DECIMAL(15,2),
    isActive BOOLEAN DEFAULT TRUE,
    maintenanceFrequency ENUM('monthly', 'half-yearly', 'annual', 'none') DEFAULT 'none',
    lastMaintenanceDate DATE,
    showToResidents BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fixed_assets (
    id VARCHAR(50) PRIMARY KEY,
    description TEXT NOT NULL,
    quantity INT DEFAULT 1,
    purchasePrice DECIMAL(15,2) DEFAULT 0,
    depreciatedValue DECIMAL(15,2) DEFAULT 0,
    model VARCHAR(255),
    details TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    image TEXT,
    purchaseDate DATE,
    requiresMaintenance BOOLEAN DEFAULT FALSE,
    nextMaintenanceDate DATE,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_maintenance_history (
    id VARCHAR(50) PRIMARY KEY,
    assetId VARCHAR(50),
    folio VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    technicianName VARCHAR(255),
    cost DECIMAL(15,2),
    observations TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assetId) REFERENCES fixed_assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- EPP, Aseo, Oficina...
    price DECIMAL(15,2) DEFAULT 0,
    stock INT DEFAULT 0,
    minStock INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_deliveries (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    personnelId VARCHAR(50),
    deliveryDate DATE NOT NULL,
    notes TEXT,
    status ENUM('active', 'voided') DEFAULT 'active',
    signedDocument TEXT, -- Base64
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personnelId) REFERENCES personnel(id)
);

CREATE TABLE IF NOT EXISTS article_delivery_items (
    deliveryId VARCHAR(50),
    articleId VARCHAR(50),
    quantity INT NOT NULL,
    size VARCHAR(20),
    PRIMARY KEY (deliveryId, articleId),
    FOREIGN KEY (deliveryId) REFERENCES article_deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (articleId) REFERENCES articles(id)
);

-- ==========================================
-- 6. COMMUNITY & COMMUNICATION
-- ==========================================

CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    userId VARCHAR(50),
    unitId VARCHAR(50),
    towerId VARCHAR(50),
    type ENUM('complaint', 'suggestion', 'visit_registration', 'reservation', 'provision_request', 'shift_report', 'incident') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    status ENUM('pending', 'read', 'attended', 'solved') DEFAULT 'pending',
    adminNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (unitId) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('residencia', 'gastos', 'estado_cuenta', 'liquidacion') NOT NULL,
    residentName VARCHAR(255) NOT NULL,
    residentRut VARCHAR(30) NOT NULL,
    residentAddress TEXT NOT NULL,
    adminName VARCHAR(255),
    condoName VARCHAR(255),
    generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_numbers (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- SEGURIDAD, EMERGENCIA, SERVICIOS...
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    description TEXT,
    webUrl TEXT,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_messages (
    id VARCHAR(50) PRIMARY KEY,
    text TEXT NOT NULL,
    type ENUM('info', 'warning', 'danger', 'success') DEFAULT 'info',
    isActive BOOLEAN DEFAULT TRUE,
    image TEXT,
    youtubeUrl TEXT,
    durationSeconds INT,
    expiresAt TIMESTAMP NULL,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS condo_board (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    position VARCHAR(255), -- Presidente, Tesorero, etc.
    signatureImage LONGTEXT, -- Base64
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS communication_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('general', 'arrears', 'emergency') DEFAULT 'general',
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS communication_history (
    id VARCHAR(50) PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipients TEXT NOT NULL, -- JSON or comma separated emails
    senderId VARCHAR(50),
    targetFilter VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. LOGS & AUDIT
-- ==========================================

CREATE TABLE IF NOT EXISTS history_logs (
    id VARCHAR(50) PRIMARY KEY,
    entityType ENUM('department', 'owner', 'resident', 'personnel', 'reservation') NOT NULL,
    entityId VARCHAR(50) NOT NULL,
    unitId VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. INITIAL MOCK DATA
-- ==========================================

INSERT IGNORE INTO users (id, name, email, role, status) VALUES 
('admin-1', 'Admin Total', 'admin@example.com', 'global_admin', 'active');

INSERT IGNORE INTO system_settings (id, systemName) VALUES (1, 'SGC - Sistema de Gestión de Condominios');

-- Initial Emergency Numbers
INSERT IGNORE INTO emergency_numbers (id, category, name, phone, description) VALUES
('em-1', 'URGENCIA', 'SAMU', '131', 'Atención Médica de Urgencia'),
('em-2', 'URGENCIA', 'Bomberos', '132', 'Rescate e Incendios'),
('em-3', 'URGENCIA', 'Carabineros', '133', 'Policía de Emergencia'),
('em-4', 'URGENCIA', 'PDI', '134', 'Policía de Investigaciones'),
('em-5', 'COMUNAL', 'Seguridad Municipal', '1401', 'Paz Ciudadana'),
('em-6', 'COMUNAL', 'Plan Cuadrante', '999999999', 'Carabineros por Zona'),
('em-7', 'SERVICIOS', 'ESVAL', '600 600 6013', 'Suministro de Agua'),
('em-8', 'SERVICIOS', 'Empresa Eléctrica', '600 000 0000', 'Chilquinta / Enel'),
('em-9', 'SERVICIOS', 'Empresa Gas', '600 000 0001', 'Lipigas / Abastible / Gasco');

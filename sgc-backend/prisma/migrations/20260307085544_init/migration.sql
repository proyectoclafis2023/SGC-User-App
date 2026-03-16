-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PensionFund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "discountRate" REAL NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HealthProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "discountRate" REAL NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UnitType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "baseCommonExpense" REAL NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Tower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "towerId" TEXT,
    "number" TEXT NOT NULL,
    "unitTypeId" TEXT,
    "propertyRole" TEXT,
    "m2" REAL,
    "waterClientId" TEXT,
    "electricityClientId" TEXT,
    "gasClientId" TEXT,
    "ownerId" TEXT,
    "residentId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Department_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "Tower" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Department_unitTypeId_fkey" FOREIGN KEY ("unitTypeId") REFERENCES "UnitType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Department_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Department_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "names" TEXT NOT NULL,
    "lastNames" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "names" TEXT NOT NULL,
    "lastNames" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "familyCount" INTEGER NOT NULL DEFAULT 1,
    "hasPets" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isTenant" BOOLEAN NOT NULL DEFAULT false,
    "rentAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Personnel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "names" TEXT NOT NULL,
    "lastNames" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "isHonorary" BOOLEAN NOT NULL DEFAULT false,
    "bankId" TEXT,
    "accountNumber" TEXT,
    "baseSalary" REAL NOT NULL,
    "vacationDays" INTEGER NOT NULL DEFAULT 0,
    "healthProviderId" TEXT,
    "pensionFundId" TEXT,
    "address" TEXT NOT NULL,
    "position" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Personnel_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Personnel_healthProviderId_fkey" FOREIGN KEY ("healthProviderId") REFERENCES "HealthProvider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Personnel_pensionFundId_fkey" FOREIGN KEY ("pensionFundId") REFERENCES "PensionFund" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Correspondence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "folio" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "towerId" TEXT,
    "type" TEXT NOT NULL,
    "addressee" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "receivedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Correspondence_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "location" TEXT,
    "isHandicapped" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "departmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Parking_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Owner_dni_key" ON "Owner"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Resident_dni_key" ON "Resident"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_dni_key" ON "Personnel"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Correspondence_folio_key" ON "Correspondence"("folio");

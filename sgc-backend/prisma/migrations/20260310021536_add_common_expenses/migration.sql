-- CreateTable
CREATE TABLE "CommonExpenseRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitTypeId" TEXT,
    "amount" REAL NOT NULL,
    "effectiveFrom" DATETIME NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommonExpenseRule_unitTypeId_fkey" FOREIGN KEY ("unitTypeId") REFERENCES "UnitType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommonExpensePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "departmentId" TEXT NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "amountPaid" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "paymentMethod" TEXT,
    "receiptFolio" TEXT,
    "evidenceImage" TEXT,
    "notes" TEXT,
    "isElectronic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommonExpensePayment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CommonExpensePayment_receiptFolio_key" ON "CommonExpensePayment"("receiptFolio");

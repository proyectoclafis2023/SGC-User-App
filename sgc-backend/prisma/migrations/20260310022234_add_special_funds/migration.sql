-- CreateTable
CREATE TABLE "SpecialFund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "totalAmountPerUnit" REAL NOT NULL,
    "totalProjectAmount" REAL,
    "deadline" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "unitConfigsJson" TEXT,
    "expensesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

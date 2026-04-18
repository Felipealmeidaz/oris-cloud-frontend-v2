-- CreateTable
CREATE TABLE "disks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "azureDiskId" TEXT,
    "userId" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vCpus" INTEGER NOT NULL DEFAULT 4,
    "sizeGB" INTEGER NOT NULL DEFAULT 256,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disks_userId_idx" ON "disks"("userId");

-- CreateIndex
CREATE INDEX "disks_isActive_idx" ON "disks"("isActive");

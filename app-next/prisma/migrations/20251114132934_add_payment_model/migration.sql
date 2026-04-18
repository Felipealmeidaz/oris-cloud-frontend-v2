-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "customId" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "qrCodeBase64" TEXT,
    "pixCopiaECola" TEXT,
    "loc" TEXT,
    "webhookSended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_customId_key" ON "Payment"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_txid_key" ON "Payment"("txid");

-- CreateIndex
CREATE INDEX "Payment_customId_idx" ON "Payment"("customId");

-- CreateIndex
CREATE INDEX "Payment_txid_idx" ON "Payment"("txid");

-- CreateIndex
CREATE INDEX "Payment_email_idx" ON "Payment"("email");

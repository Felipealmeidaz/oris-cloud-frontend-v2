-- CreateTable
CREATE TABLE "purchase_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "txid" TEXT NOT NULL,

    CONSTRAINT "purchase_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchase_tokens_token_key" ON "purchase_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_tokens_txid_key" ON "purchase_tokens"("txid");

-- CreateIndex
CREATE INDEX "purchase_tokens_token_idx" ON "purchase_tokens"("token");

-- CreateIndex
CREATE INDEX "purchase_tokens_txid_idx" ON "purchase_tokens"("txid");

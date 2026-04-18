-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "disks_name_idx" ON "disks"("name");

-- CreateIndex
CREATE INDEX "disks_userId_isActive_idx" ON "disks"("userId", "isActive");

-- CreateIndex
CREATE INDEX "purchase_tokens_isRedeemed_idx" ON "purchase_tokens"("isRedeemed");

-- CreateIndex
CREATE INDEX "purchase_tokens_expiresAt_idx" ON "purchase_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_expiresAt_idx" ON "subscriptions"("expiresAt");

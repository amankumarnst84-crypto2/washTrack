ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "RegistrationInvite" (
 "id" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "bagNo" TEXT NOT NULL,
 "tokenHash" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "usedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "RegistrationInvite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RegistrationInvite_email_key" ON "RegistrationInvite"("email");
CREATE UNIQUE INDEX "RegistrationInvite_bagNo_key" ON "RegistrationInvite"("bagNo");
CREATE UNIQUE INDEX "RegistrationInvite_tokenHash_key" ON "RegistrationInvite"("tokenHash");

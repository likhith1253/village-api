-- Brings the migration history in line with schema.prisma. The production database was evolved with
-- `prisma db push`, so these changes never had a migration. Hand-written (not run against a database
-- in this overhaul). On a database that already has these changes, mark it applied instead of running it:
--   npx prisma migrate resolve --applied 20260701000000_sync_schema_drift

-- Stripe billing columns on User
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionEndDate" TIMESTAMP(3);
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- Sub-district codes are unique per district, not globally (sentinel code 99999 repeats across states)
DROP INDEX "SubDistrict_subDistrictCode_key";
CREATE UNIQUE INDEX "SubDistrict_districtId_subDistrictCode_key" ON "SubDistrict"("districtId", "subDistrictCode");

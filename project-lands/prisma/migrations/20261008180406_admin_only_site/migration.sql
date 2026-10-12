/*
  Warnings:

  - You are about to drop the column `contactEmail` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `canCreateListings` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "listings" DROP COLUMN "contactEmail",
DROP COLUMN "contactName",
DROP COLUMN "contactPhone";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "canCreateListings";

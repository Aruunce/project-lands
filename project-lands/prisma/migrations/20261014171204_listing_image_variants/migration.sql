/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `listing_images` table. All the data in the column will be lost.
  - You are about to drop the column `storagePath` on the `listing_images` table. All the data in the column will be lost.
  - Added the required column `height` to the `listing_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbUrl` to the `listing_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `listing_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `listing_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "listing_images" DROP COLUMN "isPrimary",
DROP COLUMN "storagePath",
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "thumbUrl" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;

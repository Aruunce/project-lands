-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "areaSqm" DOUBLE PRECISION,
ADD COLUMN     "searchText" TEXT;

-- Backfill existing listings (new and edited ones are filled in by the app).
UPDATE "listings"
SET "areaSqm" = "area" * CASE "areaUnit" WHEN 'SQM' THEN 1 WHEN 'ARE' THEN 100 ELSE 10000 END,
    "searchText" = translate(
      lower(concat_ws(' ', "title", "city", "municipality", "address")),
      'ąčęėįšųūž',
      'aceeisuuz'
    );

-- CreateIndex
CREATE INDEX "listings_areaSqm_idx" ON "listings"("areaSqm");

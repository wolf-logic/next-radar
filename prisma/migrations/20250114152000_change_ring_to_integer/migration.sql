-- First create the new column
ALTER TABLE "RadarEntry" ADD COLUMN "ring_new" INTEGER;

-- Copy the data
UPDATE "RadarEntry" SET "ring_new" = CAST("ring" AS INTEGER);

-- Make the new column required
ALTER TABLE "RadarEntry" ALTER COLUMN "ring_new" SET NOT NULL;

-- Drop the old column
ALTER TABLE "RadarEntry" DROP COLUMN "ring";

-- Create the new column with the original name
ALTER TABLE "RadarEntry" RENAME COLUMN "ring_new" TO "ring";
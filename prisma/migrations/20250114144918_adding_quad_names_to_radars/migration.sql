-- AlterTable
ALTER TABLE "Radar" ADD COLUMN     "quadrantNE" VARCHAR(255) NOT NULL DEFAULT 'North East',
ADD COLUMN     "quadrantNW" VARCHAR(255) NOT NULL DEFAULT 'North West',
ADD COLUMN     "quadrantSE" VARCHAR(255) NOT NULL DEFAULT 'South East',
ADD COLUMN     "quadrantSW" VARCHAR(255) NOT NULL DEFAULT 'South West';

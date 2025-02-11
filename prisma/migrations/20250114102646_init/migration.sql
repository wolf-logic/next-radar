-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "dateCreated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Radar" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "dateCreated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Radar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadarUser" (
    "radarId" UUID NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "dateCreated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RadarUser_pkey" PRIMARY KEY ("radarId","userId")
);

-- CreateTable
CREATE TABLE "RadarEntry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "radarId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "ring" VARCHAR(255) NOT NULL,
    "quadrant" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "dateCreated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RadarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Radar_slug_key" ON "Radar"("slug");

-- CreateIndex
CREATE INDEX "RadarEntry_radarId_idx" ON "RadarEntry"("radarId");

-- CreateIndex
CREATE UNIQUE INDEX "RadarEntry_radarId_name_key" ON "RadarEntry"("radarId", "name");

-- AddForeignKey
ALTER TABLE "RadarUser" ADD CONSTRAINT "RadarUser_radarId_fkey" FOREIGN KEY ("radarId") REFERENCES "Radar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RadarUser" ADD CONSTRAINT "RadarUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RadarEntry" ADD CONSTRAINT "RadarEntry_radarId_fkey" FOREIGN KEY ("radarId") REFERENCES "Radar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

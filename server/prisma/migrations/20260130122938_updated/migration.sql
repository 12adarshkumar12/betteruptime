/*
  Warnings:

  - The primary key for the `Region` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `region_id` to the `WebsiteTicks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response_time_ms` to the `WebsiteTicks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `WebsiteTicks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `website_id` to the `WebsiteTicks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "websiteStatus" AS ENUM ('up', 'down', 'pending');

-- AlterTable
ALTER TABLE "Region" DROP CONSTRAINT "Region_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Region_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Region_id_seq";

-- AlterTable
ALTER TABLE "WebsiteTicks" ADD COLUMN     "region_id" TEXT NOT NULL,
ADD COLUMN     "response_time_ms" TEXT NOT NULL,
ADD COLUMN     "status" "websiteStatus" NOT NULL,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "website_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WebsiteTicks" ADD CONSTRAINT "WebsiteTicks_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteTicks" ADD CONSTRAINT "WebsiteTicks_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Region` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE INDEX "WebsiteTicks_website_id_region_id_time_idx" ON "WebsiteTicks"("website_id", "region_id", "time");

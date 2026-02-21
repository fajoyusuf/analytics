CREATE TABLE IF NOT EXISTS "Creative" (
  "creativeId" TEXT PRIMARY KEY NOT NULL,
  "status" TEXT,
  "duplicateFlag" TEXT,
  "creativeType" TEXT,
  "targetTraffic" TEXT,
  "type" TEXT,
  "format" TEXT,
  "style" TEXT,
  "angle" TEXT,
  "awarenessLevel" TEXT,
  "createdBy" TEXT,
  "dateCreated" DATETIME,
  "dateLaunched" DATETIME,
  "linkToAsset" TEXT,
  "winner" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Copy" (
  "copyId" TEXT PRIMARY KEY NOT NULL,
  "creativeType" TEXT,
  "targetTraffic" TEXT,
  "hook" TEXT,
  "angle" TEXT,
  "createdBy" TEXT,
  "dateCreated" DATETIME,
  "dateLaunched" DATETIME,
  "linkToAsset" TEXT,
  "status" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Lander" (
  "funnelIdentifier" TEXT PRIMARY KEY NOT NULL,
  "lander" TEXT,
  "trafficSource" TEXT,
  "frontendLink" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "MetaAd" (
  "adId" TEXT PRIMARY KEY NOT NULL,
  "adName" TEXT NOT NULL,
  "campaignName" TEXT,
  "adsetName" TEXT,
  "status" TEXT,
  "createdTime" DATETIME,
  "isSimulated" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "DailyMetaInsights" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "date" DATETIME NOT NULL,
  "adId" TEXT NOT NULL,
  "spend" REAL NOT NULL DEFAULT 0,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "cpm" REAL NOT NULL DEFAULT 0,
  "cpc" REAL NOT NULL DEFAULT 0,
  "ctr" REAL NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("adId") REFERENCES "MetaAd"("adId") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "DailyWeTracked" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "date" DATETIME NOT NULL,
  "trackingKey" TEXT,
  "adId" TEXT,
  "adName" TEXT,
  "creativeId" TEXT,
  "revenue" REAL NOT NULL DEFAULT 0,
  "purchases" INTEGER NOT NULL DEFAULT 0,
  "profit" REAL NOT NULL DEFAULT 0,
  "roas" REAL NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AdCreativeMap" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "adId" TEXT NOT NULL,
  "funnelIdentifier" TEXT,
  "creativeId" TEXT,
  "copyId" TEXT,
  "product" TEXT,
  "parseStatus" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("adId") REFERENCES "MetaAd"("adId") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("creativeId") REFERENCES "Creative"("creativeId") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("copyId") REFERENCES "Copy"("copyId") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("funnelIdentifier") REFERENCES "Lander"("funnelIdentifier") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "UnmappedAd" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "adId" TEXT,
  "adName" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "detailsJson" TEXT,
  "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ManualOverride" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "adId" TEXT,
  "adName" TEXT,
  "funnelIdentifierOverride" TEXT,
  "creativeIdOverride" TEXT,
  "copyIdOverride" TEXT,
  "productOverride" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "SyncRun" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" DATETIME,
  "countsJson" TEXT,
  "error" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "DailyMetaInsights_date_adId_key" ON "DailyMetaInsights"("date", "adId");
CREATE INDEX IF NOT EXISTS "DailyMetaInsights_date_idx" ON "DailyMetaInsights"("date");
CREATE INDEX IF NOT EXISTS "DailyMetaInsights_adId_idx" ON "DailyMetaInsights"("adId");
CREATE INDEX IF NOT EXISTS "DailyWeTracked_date_idx" ON "DailyWeTracked"("date");
CREATE INDEX IF NOT EXISTS "DailyWeTracked_creativeId_idx" ON "DailyWeTracked"("creativeId");
CREATE UNIQUE INDEX IF NOT EXISTS "AdCreativeMap_adId_source_key" ON "AdCreativeMap"("adId", "source");
CREATE INDEX IF NOT EXISTS "AdCreativeMap_creativeId_idx" ON "AdCreativeMap"("creativeId");
CREATE INDEX IF NOT EXISTS "AdCreativeMap_funnelIdentifier_idx" ON "AdCreativeMap"("funnelIdentifier");
CREATE UNIQUE INDEX IF NOT EXISTS "UnmappedAd_adName_reason_key" ON "UnmappedAd"("adName", "reason");
CREATE INDEX IF NOT EXISTS "UnmappedAd_adId_idx" ON "UnmappedAd"("adId");
CREATE UNIQUE INDEX IF NOT EXISTS "ManualOverride_adId_key" ON "ManualOverride"("adId");
CREATE UNIQUE INDEX IF NOT EXISTS "ManualOverride_adName_key" ON "ManualOverride"("adName");

import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { startOfDay } from "date-fns";
import * as xlsx from "xlsx";
import { prisma } from "@/lib/prisma";
import { parseAdName, suggestPartialParse } from "@/lib/parser";
import { excelDateToJsDate, parseCurrency, parseInteger, parsePercent } from "@/lib/utils";
import { resolveSourceFiles } from "@/lib/sync/file-locator";

type SyncCounts = Record<string, number>;

function requireFile(filePath: string, label: string) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`${label} not found at path: ${filePath || "<empty>"}`);
  }
}

function parseCsvRows(filePath: string): Array<Record<string, unknown>> {
  const raw = fs.readFileSync(filePath, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true, relax_quotes: true, bom: true });
}

function deriveSnapshotDate() {
  const configured = process.env.SYNC_SNAPSHOT_DATE?.trim();
  if (!configured) return startOfDay(new Date());
  const parsed = new Date(configured);
  if (Number.isNaN(parsed.valueOf())) return startOfDay(new Date());
  return startOfDay(parsed);
}

function normalizeCreativeId(input: unknown): string {
  return String(input || "").trim().toUpperCase();
}

async function upsertCreativeSheet(sheetPath: string, counts: SyncCounts) {
  const workbook = xlsx.readFile(sheetPath);

  const creativesRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.Creatives ?? {}, {
    defval: null,
  });
  const copyRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.Copy ?? {}, { defval: null });
  const landerRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.Lander ?? {}, { defval: null });

  for (const row of creativesRows) {
    const creativeId = normalizeCreativeId(row.Creatives);
    if (!creativeId) continue;

    await prisma.creative.upsert({
      where: { creativeId },
      update: {
        status: String(row.Status || "") || null,
        duplicateFlag: String(row["Duplicate?"] || "") || null,
        creativeType: String(row["Creative Type"] || "") || null,
        targetTraffic: String(row["Target Traffic"] || "") || null,
        type: String(row.Type || "") || null,
        format: String(row.Format || "") || null,
        style: String(row.Style || "") || null,
        angle: String(row.Angle || "") || null,
        awarenessLevel: String(row["Awareness level"] || "") || null,
        createdBy: String(row["Created By"] || "") || null,
        dateCreated: excelDateToJsDate(row["Date Created"]),
        dateLaunched: excelDateToJsDate(row["Date Launched"]),
        linkToAsset: String(row["Link To Asset"] || "") || null,
        winner: String(row["Winner?"] || "") || null,
      },
      create: {
        creativeId,
        status: String(row.Status || "") || null,
        duplicateFlag: String(row["Duplicate?"] || "") || null,
        creativeType: String(row["Creative Type"] || "") || null,
        targetTraffic: String(row["Target Traffic"] || "") || null,
        type: String(row.Type || "") || null,
        format: String(row.Format || "") || null,
        style: String(row.Style || "") || null,
        angle: String(row.Angle || "") || null,
        awarenessLevel: String(row["Awareness level"] || "") || null,
        createdBy: String(row["Created By"] || "") || null,
        dateCreated: excelDateToJsDate(row["Date Created"]),
        dateLaunched: excelDateToJsDate(row["Date Launched"]),
        linkToAsset: String(row["Link To Asset"] || "") || null,
        winner: String(row["Winner?"] || "") || null,
      },
    });
    counts.creatives = (counts.creatives || 0) + 1;
  }

  for (const row of copyRows) {
    const copyId = String(row.Copy || "").trim().toUpperCase();
    if (!copyId) continue;

    await prisma.copy.upsert({
      where: { copyId },
      update: {
        creativeType: String(row["Creative Type"] || "") || null,
        targetTraffic: String(row["Target Traffic"] || "") || null,
        hook: String(row.Hook || "") || null,
        angle: String(row.Angle || "") || null,
        createdBy: String(row["Created By"] || "") || null,
        dateCreated: excelDateToJsDate(row["Date Created"]),
        dateLaunched: excelDateToJsDate(row["Date Launched"]),
        linkToAsset: String(row["Link To Asset"] || "") || null,
        status: String(row.Status || "") || null,
      },
      create: {
        copyId,
        creativeType: String(row["Creative Type"] || "") || null,
        targetTraffic: String(row["Target Traffic"] || "") || null,
        hook: String(row.Hook || "") || null,
        angle: String(row.Angle || "") || null,
        createdBy: String(row["Created By"] || "") || null,
        dateCreated: excelDateToJsDate(row["Date Created"]),
        dateLaunched: excelDateToJsDate(row["Date Launched"]),
        linkToAsset: String(row["Link To Asset"] || "") || null,
        status: String(row.Status || "") || null,
      },
    });
    counts.copy = (counts.copy || 0) + 1;
  }

  for (const row of landerRows) {
    const funnelIdentifier = String(row["Funnel Identifier"] || "").trim().toUpperCase();
    if (!funnelIdentifier) continue;

    await prisma.lander.upsert({
      where: { funnelIdentifier },
      update: {
        lander: String(row.Lander || "") || null,
        trafficSource: String(row["Traffic Source"] || "") || null,
        frontendLink: String(row["Frontend Link"] || "") || null,
        notes: String(row.Notes || "") || null,
      },
      create: {
        funnelIdentifier,
        lander: String(row.Lander || "") || null,
        trafficSource: String(row["Traffic Source"] || "") || null,
        frontendLink: String(row["Frontend Link"] || "") || null,
        notes: String(row.Notes || "") || null,
      },
    });
    counts.landers = (counts.landers || 0) + 1;
  }
}

async function upsertCreativeSeedMetadata(seedCsvPath: string, counts: SyncCounts) {
  if (!seedCsvPath || !fs.existsSync(seedCsvPath)) return;
  const rows = parseCsvRows(seedCsvPath);

  for (const row of rows) {
    const creativeId = normalizeCreativeId(row.Creatives);
    if (!creativeId) continue;

    await prisma.creative.upsert({
      where: { creativeId },
      update: {
        status: String(row.Status || "") || null,
        creativeType: String(row["Creative Type"] || "") || null,
        targetTraffic: String(row["Target Traffic"] || "") || null,
        type: String(row.Type || "") || null,
        style: String(row.Style || "") || null,
        angle: String(row.Angle || "") || null,
        awarenessLevel: String(row["Awareness level"] || "") || null,
        createdBy: String(row["Created By"] || "") || null,
        dateCreated: excelDateToJsDate(row["Date Created"]),
        dateLaunched: excelDateToJsDate(row["Date Launched"]),
        linkToAsset: String(row["Link To Asset"] || "") || null,
        winner: String(row["Winner?"] || "") || null,
      },
      create: {
        creativeId,
        status: String(row.Status || "") || null,
        creativeType: String(row["Creative Type"] || "") || null,
        targetTraffic: String(row["Target Traffic"] || "") || null,
        type: String(row.Type || "") || null,
        format: null,
        style: String(row.Style || "") || null,
        angle: String(row.Angle || "") || null,
        awarenessLevel: String(row["Awareness level"] || "") || null,
        createdBy: String(row["Created By"] || "") || null,
        dateCreated: excelDateToJsDate(row["Date Created"]),
        dateLaunched: excelDateToJsDate(row["Date Launched"]),
        linkToAsset: String(row["Link To Asset"] || "") || null,
        winner: String(row["Winner?"] || "") || null,
      },
    });
    counts.creativeSeedRows = (counts.creativeSeedRows || 0) + 1;
  }
}

async function upsertPerformanceSeed(metaSeedPath: string, counts: SyncCounts) {
  const rows = parseCsvRows(metaSeedPath);
  const snapshotDate = deriveSnapshotDate();

  for (const row of rows) {
    const creativeId = normalizeCreativeId(row.Image);
    if (!creativeId) continue;

    // Dev mode simulation because seed data does not include ad-level identifiers.
    const simulatedAdId = `SIM-${creativeId}`;
    const adName = `A100 | ${creativeId} | C100 | P:AP`;

    await prisma.metaAd.upsert({
      where: { adId: simulatedAdId },
      update: {
        adName,
        campaignName: "Seed Campaign",
        adsetName: "Seed Adset",
        status: "ACTIVE",
        isSimulated: true,
      },
      create: {
        adId: simulatedAdId,
        adName,
        campaignName: "Seed Campaign",
        adsetName: "Seed Adset",
        status: "ACTIVE",
        isSimulated: true,
      },
    });

    const spend = parseCurrency(row.Cost);
    const impressions = parseInteger(row.Impressions);
    const clicks = parseInteger(row.Clicks);

    await prisma.dailyMetaInsights.upsert({
      where: { date_adId: { date: snapshotDate, adId: simulatedAdId } },
      update: {
        spend,
        impressions,
        clicks,
        cpm: parseCurrency(row.CPM),
        cpc: parseCurrency(row.CPC),
        ctr: parsePercent(row.CTR),
      },
      create: {
        date: snapshotDate,
        adId: simulatedAdId,
        spend,
        impressions,
        clicks,
        cpm: parseCurrency(row.CPM),
        cpc: parseCurrency(row.CPC),
        ctr: parsePercent(row.CTR),
      },
    });

    await prisma.dailyWeTracked.create({
      data: {
        date: snapshotDate,
        trackingKey: creativeId,
        adId: simulatedAdId,
        adName,
        creativeId,
        revenue: parseCurrency(row.Revenue),
        purchases: parseInteger(row["Unique Customers"]),
        profit: parseCurrency(row.PnL),
        roas: parseCurrency(row.ROAS),
      },
    });

    counts.metaAds = (counts.metaAds || 0) + 1;
    counts.metaInsights = (counts.metaInsights || 0) + 1;
    counts.wetracked = (counts.wetracked || 0) + 1;
  }
}

async function rebuildMappings(counts: SyncCounts) {
  await prisma.adCreativeMap.deleteMany({ where: { source: { in: ["PARSER", "OVERRIDE"] } } });

  const [ads, overrides, creatives, copyRows, landers] = await Promise.all([
    prisma.metaAd.findMany(),
    prisma.manualOverride.findMany(),
    prisma.creative.findMany({ select: { creativeId: true } }),
    prisma.copy.findMany({ select: { copyId: true } }),
    prisma.lander.findMany({ select: { funnelIdentifier: true } }),
  ]);

  const creativeSet = new Set(creatives.map((c) => c.creativeId));
  const copySet = new Set(copyRows.map((c) => c.copyId));
  const landerSet = new Set(landers.map((l) => l.funnelIdentifier));

  const overrideByAdId = new Map(overrides.filter((o) => o.adId).map((o) => [o.adId as string, o]));
  const overrideByAdName = new Map(overrides.filter((o) => o.adName).map((o) => [o.adName as string, o]));

  for (const ad of ads) {
    const override = overrideByAdId.get(ad.adId) ?? overrideByAdName.get(ad.adName);

    if (override) {
      await prisma.adCreativeMap.create({
        data: {
          adId: ad.adId,
          funnelIdentifier: override.funnelIdentifierOverride,
          creativeId: override.creativeIdOverride,
          copyId: override.copyIdOverride,
          product: override.productOverride || "AP",
          parseStatus: "MAPPED",
          source: "OVERRIDE",
        },
      });
      counts.overridesApplied = (counts.overridesApplied || 0) + 1;
      continue;
    }

    const parsed = parseAdName(ad.adName);
    if (!parsed.ok) {
      const suggestion = suggestPartialParse(ad.adName);
      await prisma.unmappedAd.upsert({
        where: { adName_reason: { adName: ad.adName, reason: parsed.reason } },
        update: {
          lastSeen: new Date(),
          detailsJson: JSON.stringify({ parsed: parsed.parsed, suggestion }),
        },
        create: {
          adId: ad.adId,
          adName: ad.adName,
          reason: parsed.reason,
          detailsJson: JSON.stringify({ parsed: parsed.parsed, suggestion }),
        },
      });
      counts.unmapped = (counts.unmapped || 0) + 1;
      continue;
    }

    const reasonParts: string[] = [];
    if (!creativeSet.has(parsed.parsed.creativeId!)) reasonParts.push("creative_id_not_found");
    if (!copySet.has(parsed.parsed.copyId!)) reasonParts.push("copy_id_not_found");
    if (!landerSet.has(parsed.parsed.funnelIdentifier!)) reasonParts.push("funnel_identifier_not_found");

    if (reasonParts.length) {
      await prisma.unmappedAd.upsert({
        where: { adName_reason: { adName: ad.adName, reason: reasonParts.join(",") } },
        update: {
          lastSeen: new Date(),
          detailsJson: JSON.stringify({ parsed: parsed.parsed }),
        },
        create: {
          adId: ad.adId,
          adName: ad.adName,
          reason: reasonParts.join(","),
          detailsJson: JSON.stringify({ parsed: parsed.parsed }),
        },
      });
      counts.unmapped = (counts.unmapped || 0) + 1;
      continue;
    }

    await prisma.adCreativeMap.create({
      data: {
        adId: ad.adId,
        funnelIdentifier: parsed.parsed.funnelIdentifier,
        creativeId: parsed.parsed.creativeId,
        copyId: parsed.parsed.copyId,
        product: parsed.parsed.productCode?.replace(/^P:/, "") || "AP",
        parseStatus: "MAPPED",
        source: "PARSER",
      },
    });
    counts.mapped = (counts.mapped || 0) + 1;
  }
}

export async function runLocalSync() {
  const startedAt = new Date();
  const run = await prisma.syncRun.create({
    data: {
      type: "LOCAL",
      status: "RUNNING",
      startedAt,
    },
  });

  try {
    const paths = resolveSourceFiles();
    requireFile(paths.creativeSheetPath, "Creative metadata file");
    requireFile(paths.metaSeedPath, "Meta performance seed CSV");

    const counts: SyncCounts = {};

    await prisma.$transaction([
      prisma.dailyMetaInsights.deleteMany(),
      prisma.dailyWeTracked.deleteMany(),
      prisma.adCreativeMap.deleteMany(),
      prisma.unmappedAd.deleteMany(),
    ]);

    await upsertCreativeSheet(paths.creativeSheetPath, counts);
    await upsertCreativeSeedMetadata(paths.creativeSeedPath, counts);
    await upsertPerformanceSeed(paths.metaSeedPath, counts);
    await rebuildMappings(counts);

    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        countsJson: JSON.stringify({ ...counts, files: paths }),
      },
    });

    return { ok: true, counts, files: paths };
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      },
    });

    throw error;
  }
}

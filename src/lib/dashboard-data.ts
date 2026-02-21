import { endOfDay, format, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { safeDivide } from "@/lib/utils";
import type { CreativeMetrics, CreativeRow } from "@/types/dashboard";

const EMPTY_METRICS: CreativeMetrics = {
  spend: 0,
  revenue: 0,
  profit: 0,
  purchases: 0,
  roas: 0,
  cpa: 0,
  cpm: 0,
  impressions: 0,
  clicks: 0,
  ctr: 0,
  cpc: 0,
};

function finalizeMetrics(input: Omit<CreativeMetrics, "roas" | "cpa" | "cpm" | "ctr" | "cpc">): CreativeMetrics {
  return {
    ...input,
    roas: safeDivide(input.revenue, input.spend),
    cpa: safeDivide(input.spend, input.purchases),
    cpm: input.impressions > 0 ? (input.spend / input.impressions) * 1000 : 0,
    ctr: safeDivide(input.clicks, input.impressions),
    cpc: safeDivide(input.spend, input.clicks),
  };
}

async function collectMetricsByCreative(start: Date, end: Date, creativeIds?: string[]) {
  const mapWhere = {
    parseStatus: "MAPPED",
    ...(creativeIds?.length ? { creativeId: { in: creativeIds } } : {}),
  };

  const adMaps = await prisma.adCreativeMap.findMany({
    where: mapWhere,
    select: { adId: true, creativeId: true },
  });

  const adToCreative = new Map<string, string>();
  const adIds: string[] = [];

  for (const map of adMaps) {
    if (!map.creativeId) continue;
    adToCreative.set(map.adId, map.creativeId);
    adIds.push(map.adId);
  }

  const insights = adIds.length
    ? await prisma.dailyMetaInsights.findMany({
        where: {
          adId: { in: adIds },
          date: { gte: startOfDay(start), lte: endOfDay(end) },
        },
        select: { adId: true, spend: true, impressions: true, clicks: true },
      })
    : [];

  const wetracked = await prisma.dailyWeTracked.findMany({
    where: {
      date: { gte: startOfDay(start), lte: endOfDay(end) },
      ...(creativeIds?.length ? { creativeId: { in: creativeIds } } : {}),
    },
    select: { creativeId: true, revenue: true, profit: true, purchases: true },
  });

  const base = new Map<string, Omit<CreativeMetrics, "roas" | "cpa" | "cpm" | "ctr" | "cpc">>();

  for (const item of insights) {
    const creativeId = adToCreative.get(item.adId);
    if (!creativeId) continue;
    const current = base.get(creativeId) ?? {
      spend: 0,
      revenue: 0,
      profit: 0,
      purchases: 0,
      impressions: 0,
      clicks: 0,
    };
    current.spend += item.spend;
    current.impressions += item.impressions;
    current.clicks += item.clicks;
    base.set(creativeId, current);
  }

  for (const item of wetracked) {
    if (!item.creativeId) continue;
    const current = base.get(item.creativeId) ?? {
      spend: 0,
      revenue: 0,
      profit: 0,
      purchases: 0,
      impressions: 0,
      clicks: 0,
    };
    current.revenue += item.revenue;
    current.profit += item.profit;
    current.purchases += item.purchases;
    base.set(item.creativeId, current);
  }

  const finalized = new Map<string, CreativeMetrics>();
  for (const [creativeId, metrics] of base.entries()) {
    finalized.set(creativeId, finalizeMetrics(metrics));
  }

  return finalized;
}

export async function getOverviewData(start: Date, end: Date) {
  const metricsByCreative = await collectMetricsByCreative(start, end);

  let totals = { ...EMPTY_METRICS };
  for (const metrics of metricsByCreative.values()) {
    totals.spend += metrics.spend;
    totals.revenue += metrics.revenue;
    totals.profit += metrics.profit;
    totals.purchases += metrics.purchases;
    totals.impressions += metrics.impressions;
    totals.clicks += metrics.clicks;
  }
  totals = finalizeMetrics(totals);

  const creativesLaunched = await prisma.creative.findMany({
    where: { dateLaunched: { gte: startOfDay(start), lte: endOfDay(end) } },
    select: { dateLaunched: true },
  });

  const launchBuckets = new Map<string, number>();
  for (const item of creativesLaunched) {
    if (!item.dateLaunched) continue;
    const key = format(item.dateLaunched, "yyyy-MM-dd");
    launchBuckets.set(key, (launchBuckets.get(key) ?? 0) + 1);
  }

  const launchData = Array.from(launchBuckets.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const creativeRows = await prisma.creative.findMany({
    select: { creativeId: true, angle: true, status: true, winner: true },
  });

  const topRows = creativeRows
    .map((row) => ({
      creativeId: row.creativeId,
      angle: row.angle ?? "-",
      status: row.status ?? "-",
      winner: row.winner ?? "-",
      metrics: metricsByCreative.get(row.creativeId) ?? EMPTY_METRICS,
    }))
    .filter((row) => row.metrics.spend > 0 || row.metrics.revenue > 0)
    .sort((a, b) => b.metrics.revenue - a.metrics.revenue);

  return {
    totals,
    launchData,
    topByRevenue: topRows.slice(0, 10),
    topByRoas: [...topRows].sort((a, b) => b.metrics.roas - a.metrics.roas).slice(0, 10),
    topBySpend: [...topRows].sort((a, b) => b.metrics.spend - a.metrics.spend).slice(0, 10),
  };
}

export async function getCreativeRows(
  start: Date,
  end: Date,
  filters: Record<string, string | undefined>,
  pagination: { page: number; pageSize: number }
) {
  const where = {
    ...(filters.search ? { creativeId: { contains: filters.search, mode: "insensitive" as const } } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.winner ? { winner: filters.winner } : {}),
    ...(filters.angle ? { angle: filters.angle } : {}),
    ...(filters.format ? { format: filters.format } : {}),
    ...(filters.style ? { style: filters.style } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.targetTraffic ? { targetTraffic: filters.targetTraffic } : {}),
    ...(filters.createdBy ? { createdBy: filters.createdBy } : {}),
  };

  const [count, creatives] = await Promise.all([
    prisma.creative.count({ where }),
    prisma.creative.findMany({
      where,
      orderBy: [{ dateLaunched: "desc" }, { creativeId: "asc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
  ]);

  const ids = creatives.map((creative) => creative.creativeId);
  const metricsByCreative = await collectMetricsByCreative(start, end, ids);

  const rows: CreativeRow[] = creatives.map((creative) => ({
    creativeId: creative.creativeId,
    status: creative.status ?? "-",
    winner: creative.winner ?? "-",
    angle: creative.angle ?? "-",
    format: creative.format ?? "-",
    style: creative.style ?? "-",
    type: creative.type ?? "-",
    targetTraffic: creative.targetTraffic ?? "-",
    awarenessLevel: creative.awarenessLevel ?? "-",
    createdBy: creative.createdBy ?? "-",
    dateLaunched: creative.dateLaunched ? format(creative.dateLaunched, "yyyy-MM-dd") : null,
    linkToAsset: creative.linkToAsset,
    metrics: metricsByCreative.get(creative.creativeId) ?? EMPTY_METRICS,
  }));

  return {
    rows,
    total: count,
    pages: Math.max(1, Math.ceil(count / pagination.pageSize)),
  };
}

export async function getCreativeFilterOptions() {
  const creatives = await prisma.creative.findMany({
    select: {
      status: true,
      winner: true,
      angle: true,
      format: true,
      style: true,
      type: true,
      targetTraffic: true,
      createdBy: true,
    },
  });

  const collect = (key: keyof (typeof creatives)[number]) =>
    Array.from(new Set(creatives.map((row) => row[key]).filter((value): value is string => Boolean(value)))).sort();

  return {
    status: collect("status"),
    winner: collect("winner"),
    angle: collect("angle"),
    format: collect("format"),
    style: collect("style"),
    type: collect("type"),
    targetTraffic: collect("targetTraffic"),
    createdBy: collect("createdBy"),
  };
}

export async function getCreativeDetail(creativeId: string, start: Date, end: Date) {
  const creative = await prisma.creative.findUnique({ where: { creativeId } });
  if (!creative) return null;

  const maps = await prisma.adCreativeMap.findMany({
    where: { creativeId, parseStatus: "MAPPED" },
    include: {
      ad: true,
      copy: true,
      lander: true,
    },
  });

  const adIds = maps.map((m) => m.adId);

  const insights = adIds.length
    ? await prisma.dailyMetaInsights.findMany({
        where: { adId: { in: adIds }, date: { gte: startOfDay(start), lte: endOfDay(end) } },
        orderBy: { date: "asc" },
      })
    : [];

  const weTracked = await prisma.dailyWeTracked.findMany({
    where: { creativeId, date: { gte: startOfDay(start), lte: endOfDay(end) } },
    orderBy: { date: "asc" },
  });

  const timeline = new Map<string, { date: string; spend: number; revenue: number }>();

  for (const row of insights) {
    const key = format(row.date, "yyyy-MM-dd");
    const curr = timeline.get(key) ?? { date: key, spend: 0, revenue: 0 };
    curr.spend += row.spend;
    timeline.set(key, curr);
  }

  for (const row of weTracked) {
    const key = format(row.date, "yyyy-MM-dd");
    const curr = timeline.get(key) ?? { date: key, spend: 0, revenue: 0 };
    curr.revenue += row.revenue;
    timeline.set(key, curr);
  }

  const breakdown = maps.map((map) => {
    const adSpend = insights.filter((i) => i.adId === map.adId).reduce((acc, i) => acc + i.spend, 0);
    return {
      adId: map.adId,
      adName: map.ad.adName,
      campaignName: map.ad.campaignName ?? "-",
      adsetName: map.ad.adsetName ?? "-",
      spend: adSpend,
      copyId: map.copyId,
      funnelIdentifier: map.funnelIdentifier,
    };
  });

  return {
    creative,
    maps,
    timeline: Array.from(timeline.values()).sort((a, b) => a.date.localeCompare(b.date)),
    breakdown,
  };
}

export async function getAnalysisData(start: Date, end: Date, dimension: string) {
  const keyMap: Record<string, keyof CreativeRow> = {
    angle: "angle",
    format: "format",
    style: "style",
    type: "type",
    targetTraffic: "targetTraffic",
    awarenessLevel: "awarenessLevel",
    createdBy: "createdBy",
    winner: "winner",
    status: "status",
  };

  const field = keyMap[dimension] ?? "angle";

  const creatives = await prisma.creative.findMany();
  const metricsByCreative = await collectMetricsByCreative(
    start,
    end,
    creatives.map((c) => c.creativeId)
  );

  const grouped = new Map<string, Omit<CreativeMetrics, "roas" | "cpa" | "cpm" | "ctr" | "cpc">>();

  for (const creative of creatives) {
    const row: CreativeRow = {
      creativeId: creative.creativeId,
      status: creative.status ?? "-",
      winner: creative.winner ?? "-",
      angle: creative.angle ?? "-",
      format: creative.format ?? "-",
      style: creative.style ?? "-",
      type: creative.type ?? "-",
      targetTraffic: creative.targetTraffic ?? "-",
      awarenessLevel: creative.awarenessLevel ?? "-",
      createdBy: creative.createdBy ?? "-",
      dateLaunched: creative.dateLaunched ? format(creative.dateLaunched, "yyyy-MM-dd") : null,
      linkToAsset: creative.linkToAsset,
      metrics: metricsByCreative.get(creative.creativeId) ?? EMPTY_METRICS,
    };

    const groupKey = String(row[field] ?? "-");
    const current = grouped.get(groupKey) ?? {
      spend: 0,
      revenue: 0,
      profit: 0,
      purchases: 0,
      impressions: 0,
      clicks: 0,
    };

    current.spend += row.metrics.spend;
    current.revenue += row.metrics.revenue;
    current.profit += row.metrics.profit;
    current.purchases += row.metrics.purchases;
    current.impressions += row.metrics.impressions;
    current.clicks += row.metrics.clicks;
    grouped.set(groupKey, current);
  }

  const rows = Array.from(grouped.entries())
    .map(([name, metrics]) => ({ name, metrics: finalizeMetrics(metrics) }))
    .sort((a, b) => b.metrics.spend - a.metrics.spend);

  const totals = rows.reduce(
    (acc, row) => {
      acc.spend += row.metrics.spend;
      acc.revenue += row.metrics.revenue;
      acc.profit += row.metrics.profit;
      acc.purchases += row.metrics.purchases;
      acc.impressions += row.metrics.impressions;
      acc.clicks += row.metrics.clicks;
      return acc;
    },
    { spend: 0, revenue: 0, profit: 0, purchases: 0, impressions: 0, clicks: 0 }
  );

  return {
    dimension: field,
    totals: finalizeMetrics(totals),
    rows,
    chart: rows.slice(0, 12).map((row) => ({ name: row.name, spend: row.metrics.spend })),
  };
}

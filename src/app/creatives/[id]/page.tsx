export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpendRevenueTimeline } from "@/components/dashboard/charts";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { getCreativeDetail } from "@/lib/dashboard-data";
import { formatMoney, getDateRange } from "@/lib/utils";

export default async function CreativeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const route = await params;
  const query = await searchParams;
  const range = getDateRange(query);
  const detail = await getCreativeDetail(route.id.toUpperCase(), range.start, range.end);

  if (!detail) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Creative {detail.creative.creativeId}</h2>
          <p className="text-sm text-slate-400">Metadata, assets, timeline, and ad breakdown.</p>
        </div>
        <Link href="/creatives" className="text-sm text-sky-300 hover:underline">
          Back to creatives
        </Link>
      </div>

      <DateRangeSelector
        basePath={`/creatives/${detail.creative.creativeId}`}
        currentPreset={range.preset}
        startDate={query.startDate}
        endDate={query.endDate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <div className="flex flex-wrap gap-2">
            <Badge>Status: {detail.creative.status || "-"}</Badge>
            <Badge>Winner: {detail.creative.winner || "-"}</Badge>
            <Badge>Angle: {detail.creative.angle || "-"}</Badge>
            <Badge>Format: {detail.creative.format || "-"}</Badge>
            <Badge>Style: {detail.creative.style || "-"}</Badge>
            <Badge>Type: {detail.creative.type || "-"}</Badge>
          </div>
          {detail.creative.linkToAsset ? (
            <a href={detail.creative.linkToAsset} target="_blank" rel="noreferrer" className="text-sky-300 underline">
              Linked Asset
            </a>
          ) : (
            <p className="text-slate-500">No asset link</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendRevenueTimeline data={detail.timeline} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown by Ad / Adset / Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Ad ID</Th>
                  <Th>Ad Name</Th>
                  <Th>Campaign</Th>
                  <Th>Adset</Th>
                  <Th>Spend</Th>
                  <Th>Copy ID</Th>
                  <Th>Funnel ID</Th>
                </tr>
              </thead>
              <tbody>
                {detail.breakdown.map((row) => (
                  <tr key={row.adId} className="border-t border-slate-800">
                    <Td>{row.adId}</Td>
                    <Td>{row.adName}</Td>
                    <Td>{row.campaignName}</Td>
                    <Td>{row.adsetName}</Td>
                    <Td>{formatMoney(row.spend)}</Td>
                    <Td>{row.copyId || "-"}</Td>
                    <Td>{row.funnelIdentifier || "-"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

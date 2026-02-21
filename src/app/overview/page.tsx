import Link from "next/link";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CreativesLaunchedChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { getOverviewData } from "@/lib/dashboard-data";
import { formatMoney, formatNumber, formatPercent, getDateRange } from "@/lib/utils";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const range = getDateRange(params);
  const data = await getOverviewData(range.start, range.end);
  const summaryMode = params.summary || "revenue";
  const summaryRows =
    summaryMode === "roas" ? data.topByRoas : summaryMode === "spend" ? data.topBySpend : data.topByRevenue;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-sm text-slate-400">{range.label}</p>
      </div>

      <DateRangeSelector
        basePath="/overview"
        currentPreset={range.preset}
        startDate={params.startDate}
        endDate={params.endDate}
      />

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard title="Spend" value={formatMoney(data.totals.spend)} />
        <KpiCard title="Revenue" value={formatMoney(data.totals.revenue)} />
        <KpiCard title="Profit" value={formatMoney(data.totals.profit)} />
        <KpiCard title="ROAS" value={data.totals.roas.toFixed(2)} />
        <KpiCard title="CPA" value={formatMoney(data.totals.cpa)} />
        <KpiCard title="CPM" value={formatMoney(data.totals.cpm)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Creatives Tested Daily (Creatives Sheet)</CardTitle>
        </CardHeader>
        <CardContent>
          <CreativesLaunchedChart data={data.launchData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top 10 Creatives</CardTitle>
          <div className="flex gap-2">
            <Link href="/overview?summary=revenue">
              <Badge className={summaryMode === "revenue" ? "border-sky-500" : ""}>Revenue</Badge>
            </Link>
            <Link href="/overview?summary=roas">
              <Badge className={summaryMode === "roas" ? "border-sky-500" : ""}>ROAS</Badge>
            </Link>
            <Link href="/overview?summary=spend">
              <Badge className={summaryMode === "spend" ? "border-sky-500" : ""}>Spend</Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Creative</Th>
                  <Th>Angle</Th>
                  <Th>Status</Th>
                  <Th>Spend</Th>
                  <Th>Revenue</Th>
                  <Th>ROAS</Th>
                  <Th>Clicks</Th>
                  <Th>CTR</Th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.creativeId} className="border-t border-slate-800">
                    <Td>
                      <Link href={`/creatives/${row.creativeId}`} className="text-sky-300 hover:underline">
                        {row.creativeId}
                      </Link>
                    </Td>
                    <Td>{row.angle}</Td>
                    <Td>{row.status}</Td>
                    <Td>{formatMoney(row.metrics.spend)}</Td>
                    <Td>{formatMoney(row.metrics.revenue)}</Td>
                    <Td>{row.metrics.roas.toFixed(2)}</Td>
                    <Td>{formatNumber(row.metrics.clicks)}</Td>
                    <Td>{formatPercent(row.metrics.ctr)}</Td>
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

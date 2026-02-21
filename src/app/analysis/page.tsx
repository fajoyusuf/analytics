import Link from "next/link";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SimpleSpendBar } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { getAnalysisData } from "@/lib/dashboard-data";
import { formatMoney, getDateRange } from "@/lib/utils";

const tabs = [
  "angle",
  "format",
  "style",
  "type",
  "targetTraffic",
  "awarenessLevel",
  "createdBy",
  "winner",
  "status",
] as const;

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const range = getDateRange(params);
  const dimension = tabs.includes((params.dimension as (typeof tabs)[number]) || "angle")
    ? (params.dimension as (typeof tabs)[number])
    : "angle";
  const data = await getAnalysisData(range.start, range.end, dimension);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Analysis</h2>
        <p className="text-sm text-slate-400">Aggregate performance by creative dimensions.</p>
      </div>

      <DateRangeSelector
        basePath="/analysis"
        currentPreset={range.preset}
        startDate={params.startDate}
        endDate={params.endDate}
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/analysis?dimension=${tab}`}
            className={`rounded border px-3 py-1 text-sm ${dimension === tab ? "border-sky-500 text-sky-300" : "border-slate-700 text-slate-300"}`}
          >
            {tab}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <KpiCard title="Spend" value={formatMoney(data.totals.spend)} />
        <KpiCard title="Revenue" value={formatMoney(data.totals.revenue)} />
        <KpiCard title="Profit" value={formatMoney(data.totals.profit)} />
        <KpiCard title="ROAS" value={data.totals.roas.toFixed(2)} />
        <KpiCard title="CPA" value={formatMoney(data.totals.cpa)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spend by {dimension}</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleSpendBar data={data.chart} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ranked Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>{dimension}</Th>
                  <Th>Spend</Th>
                  <Th>Revenue</Th>
                  <Th>Profit</Th>
                  <Th>ROAS</Th>
                  <Th>CPA</Th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.name} className="border-t border-slate-800">
                    <Td>{row.name}</Td>
                    <Td>{formatMoney(row.metrics.spend)}</Td>
                    <Td>{formatMoney(row.metrics.revenue)}</Td>
                    <Td>{formatMoney(row.metrics.profit)}</Td>
                    <Td>{row.metrics.roas.toFixed(2)}</Td>
                    <Td>{formatMoney(row.metrics.cpa)}</Td>
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

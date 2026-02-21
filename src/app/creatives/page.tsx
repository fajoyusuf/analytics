import Link from "next/link";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { getCreativeFilterOptions, getCreativeRows } from "@/lib/dashboard-data";
import { formatMoney, formatNumber, formatPercent, getDateRange } from "@/lib/utils";

function buildQuery(params: Record<string, string | undefined>, updates: Record<string, string | undefined>) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, ...updates })) {
    if (v) next.set(k, v);
  }
  return next.toString();
}

export default async function CreativesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const range = getDateRange(params);
  const page = Number(params.page || 1);
  const pageSize = 25;

  const [data, filters] = await Promise.all([
    getCreativeRows(range.start, range.end, params, { page, pageSize }),
    getCreativeFilterOptions(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Creatives</h2>
        <p className="text-sm text-slate-400">One row per creative with performance + metadata.</p>
      </div>

      <DateRangeSelector
        basePath="/creatives"
        currentPreset={range.preset}
        startDate={params.startDate}
        endDate={params.endDate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-2 md:grid-cols-5">
            <Input name="search" defaultValue={params.search} placeholder="Search creative_id" />
            <Select name="status" defaultValue={params.status || ""}>
              <option value="">All status</option>
              {filters.status.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
            <Select name="winner" defaultValue={params.winner || ""}>
              <option value="">All winner</option>
              {filters.winner.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
            <Select name="angle" defaultValue={params.angle || ""}>
              <option value="">All angle</option>
              {filters.angle.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
            <Select name="format" defaultValue={params.format || ""}>
              <option value="">All format</option>
              {filters.format.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
            <Select name="style" defaultValue={params.style || ""}>
              <option value="">All style</option>
              {filters.style.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
            <Select name="type" defaultValue={params.type || ""}>
              <option value="">All type</option>
              {filters.type.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
            <Select name="targetTraffic" defaultValue={params.targetTraffic || ""}>
              <option value="">All target traffic</option>
              {filters.targetTraffic.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
            <Select name="createdBy" defaultValue={params.createdBy || ""}>
              <option value="">All created by</option>
              {filters.createdBy.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
            <button className="h-9 rounded-md bg-sky-500 px-4 text-sm font-medium text-slate-950">Apply</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Creative Performance</CardTitle>
          <div className="text-xs text-slate-400">
            Page {page} / {data.pages} ({data.total} creatives)
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Creative</Th>
                  <Th>Status</Th>
                  <Th>Winner</Th>
                  <Th>Angle</Th>
                  <Th>Format</Th>
                  <Th>Style</Th>
                  <Th>Type</Th>
                  <Th>Target</Th>
                  <Th>Awareness</Th>
                  <Th>Created By</Th>
                  <Th>Date Launched</Th>
                  <Th>Spend</Th>
                  <Th>Revenue</Th>
                  <Th>Profit</Th>
                  <Th>ROAS</Th>
                  <Th>CPA</Th>
                  <Th>CPM</Th>
                  <Th>Impressions</Th>
                  <Th>Clicks</Th>
                  <Th>CTR</Th>
                  <Th>CPC</Th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.creativeId} className="border-t border-slate-800">
                    <Td>
                      <Link href={`/creatives/${row.creativeId}`} className="text-sky-300 hover:underline">
                        {row.creativeId}
                      </Link>
                    </Td>
                    <Td>{row.status}</Td>
                    <Td>{row.winner}</Td>
                    <Td>{row.angle}</Td>
                    <Td>{row.format}</Td>
                    <Td>{row.style}</Td>
                    <Td>{row.type}</Td>
                    <Td>{row.targetTraffic}</Td>
                    <Td>{row.awarenessLevel}</Td>
                    <Td>{row.createdBy}</Td>
                    <Td>{row.dateLaunched || "-"}</Td>
                    <Td>{formatMoney(row.metrics.spend)}</Td>
                    <Td>{formatMoney(row.metrics.revenue)}</Td>
                    <Td>{formatMoney(row.metrics.profit)}</Td>
                    <Td>{row.metrics.roas.toFixed(2)}</Td>
                    <Td>{formatMoney(row.metrics.cpa)}</Td>
                    <Td>{formatMoney(row.metrics.cpm)}</Td>
                    <Td>{formatNumber(row.metrics.impressions)}</Td>
                    <Td>{formatNumber(row.metrics.clicks)}</Td>
                    <Td>{formatPercent(row.metrics.ctr)}</Td>
                    <Td>{formatMoney(row.metrics.cpc)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-4 flex gap-2">
            {page > 1 ? (
              <Link
                className="rounded border border-slate-700 px-3 py-1 text-sm"
                href={`/creatives?${buildQuery(params, { page: String(page - 1) })}`}
              >
                Previous
              </Link>
            ) : null}
            {page < data.pages ? (
              <Link
                className="rounded border border-slate-700 px-3 py-1 text-sm"
                href={`/creatives?${buildQuery(params, { page: String(page + 1) })}`}
              >
                Next
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

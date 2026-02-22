export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { UnmappedOverrideForm } from "@/components/dashboard/unmapped-override-form";
import { prisma } from "@/lib/prisma";

export default async function UnmappedAdsPage() {
  const unmapped = await prisma.unmappedAd.findMany({
    orderBy: { lastSeen: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Unmapped Ads</h2>
        <p className="text-sm text-slate-400">Rows that failed parse/mapping and require action.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unmapped Count: {unmapped.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Ad ID</Th>
                  <Th>Ad Name</Th>
                  <Th>Reason</Th>
                  <Th>First Seen</Th>
                  <Th>Last Seen</Th>
                  <Th>Suggested Parse</Th>
                  <Th>Manual Override</Th>
                </tr>
              </thead>
              <tbody>
                {unmapped.map((row) => {
                  let suggested = "-";
                  try {
                    const parsed = row.detailsJson ? JSON.parse(row.detailsJson) : null;
                    suggested = parsed?.suggestion ? JSON.stringify(parsed.suggestion) : suggested;
                  } catch {
                    suggested = "-";
                  }

                  return (
                    <tr key={row.id} className="border-t border-slate-800 align-top">
                      <Td>{row.adId || "-"}</Td>
                      <Td className="max-w-md whitespace-normal">{row.adName}</Td>
                      <Td className="max-w-md whitespace-normal text-rose-300">{row.reason}</Td>
                      <Td>{row.firstSeen.toISOString().slice(0, 10)}</Td>
                      <Td>{row.lastSeen.toISOString().slice(0, 10)}</Td>
                      <Td className="max-w-md whitespace-normal text-xs text-slate-400">{suggested}</Td>
                      <Td>
                        <UnmappedOverrideForm adId={row.adId} adName={row.adName} />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

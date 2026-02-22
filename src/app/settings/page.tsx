export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { resolveSourceFiles } from "@/lib/sync/file-locator";

function status(ok: boolean) {
  return ok ? "Connected" : "Using seed data";
}

export default async function SettingsPage() {
  const lastRun = await prisma.syncRun.findFirst({ orderBy: { startedAt: "desc" } });
  const files = resolveSourceFiles();

  const hasMeta = Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
  const hasWeTracked = Boolean(process.env.WETRACKED_API_KEY);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-slate-400">Connection status and sync controls.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={hasMeta ? "border-emerald-500 text-emerald-300" : "border-amber-500 text-amber-300"}>
              {status(hasMeta)}
            </Badge>
            <p className="mt-2 text-xs text-slate-400">Requires META_ACCESS_TOKEN + META_AD_ACCOUNT_ID</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WeTracked</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={hasWeTracked ? "border-emerald-500 text-emerald-300" : "border-amber-500 text-amber-300"}>
              {status(hasWeTracked)}
            </Badge>
            <p className="mt-2 text-xs text-slate-400">Requires WETRACKED_API_KEY + WETRACKED_BASE_URL</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Creative Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">{files.creativeSheetPath}</p>
            <p className="mt-2 text-xs text-slate-400">In production, replace with uploaded sheet storage.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Last Sync</CardTitle>
        </CardHeader>
        <CardContent>
          {lastRun ? (
            <div className="space-y-1 text-sm text-slate-300">
              <p>Status: {lastRun.status}</p>
              <p>Type: {lastRun.type}</p>
              <p>Started: {lastRun.startedAt.toISOString()}</p>
              <p>Finished: {lastRun.finishedAt?.toISOString() || "-"}</p>
              <p className="text-xs text-slate-400">Counts: {lastRun.countsJson || "-"}</p>
              {lastRun.error ? <p className="text-rose-300">Error: {lastRun.error}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No sync run yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const presets = [4, 7, 14, 30, 90];

export function DateRangeSelector({
  basePath,
  currentPreset,
  startDate,
  endDate,
}: {
  basePath: string;
  currentPreset?: number;
  startDate?: string;
  endDate?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Link key={preset} href={`${basePath}?preset=${preset}`}>
            <Button variant={currentPreset === preset ? "default" : "secondary"} size="sm">
              {preset}d
            </Button>
          </Link>
        ))}
      </div>
      <form action={basePath} className="flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs text-slate-400">Start</label>
          <Input type="date" name="startDate" defaultValue={startDate} />
        </div>
        <div>
          <label className="text-xs text-slate-400">End</label>
          <Input type="date" name="endDate" defaultValue={endDate} />
        </div>
        <Button type="submit" size="sm">
          Apply
        </Button>
      </form>
    </div>
  );
}

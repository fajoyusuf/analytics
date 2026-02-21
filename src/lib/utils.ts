import { addDays, format, parseISO, startOfDay } from "date-fns";

export type PresetRange = 4 | 7 | 14 | 30 | 90;

export function cn(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

export function parseCurrency(value: unknown): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[$,%\s,]/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parsePercent(value: unknown): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[%,\s]/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed / 100 : 0;
}

export function parseInteger(value: unknown): number {
  if (typeof value === "number") return Math.trunc(value);
  if (!value) return 0;
  const cleaned = String(value).replace(/[\s,]/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

export function safeDivide(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return numerator / denominator;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function excelDateToJsDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return addDays(excelEpoch, value);
  }
  const asString = String(value).trim();
  if (!asString) return null;
  const parsed = new Date(asString);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

export function getDateRange(input: {
  preset?: string;
  startDate?: string;
  endDate?: string;
}) {
  const now = startOfDay(new Date());
  if (input.startDate && input.endDate) {
    return {
      start: startOfDay(parseISO(input.startDate)),
      end: startOfDay(parseISO(input.endDate)),
      label: `${input.startDate} to ${input.endDate}`,
    };
  }

  const preset = Number(input.preset || 30) as PresetRange;
  const validPreset = [4, 7, 14, 30, 90].includes(preset) ? preset : 30;
  return {
    start: addDays(now, -(validPreset - 1)),
    end: now,
    label: `Last ${validPreset} days`,
    preset: validPreset,
  };
}

export function toISODate(date: Date) {
  return format(startOfDay(date), "yyyy-MM-dd");
}

import fs from "node:fs";
import path from "node:path";

const DOWNLOADS_DIR = "/Users/Apple/Downloads";

function findByIncludes(dir: string, includes: string[]) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const ok = includes.every((token) => file.includes(token));
    if (ok) return path.join(dir, file);
  }
  return null;
}

export function resolveSourceFiles() {
  const creativeSheetPath = process.env.CREATIVE_SHEET_PATH || path.join(DOWNLOADS_DIR, "AP _ Creative Sheet.xlsx");
  const metaSeedPath =
    process.env.META_SEED_CSV_PATH || findByIncludes(DOWNLOADS_DIR, ["Data 2.16.15", "PM.csv"]) || "";
  const creativeSeedPath =
    process.env.CREATIVE_SEED_CSV_PATH || findByIncludes(DOWNLOADS_DIR, ["Creatives 3.58.44", "PM.csv"]) || "";

  return {
    creativeSheetPath,
    metaSeedPath,
    creativeSeedPath,
  };
}

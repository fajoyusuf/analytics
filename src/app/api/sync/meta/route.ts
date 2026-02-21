import { NextResponse } from "next/server";
import { runMetaSync } from "@/lib/sync/meta-sync";

export async function POST() {
  const result = await runMetaSync();
  return NextResponse.json(result);
}

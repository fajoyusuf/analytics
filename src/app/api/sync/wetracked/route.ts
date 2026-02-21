import { NextResponse } from "next/server";
import { runWeTrackedSync } from "@/lib/sync/wetracked-sync";

export async function POST() {
  const result = await runWeTrackedSync();
  return NextResponse.json(result);
}

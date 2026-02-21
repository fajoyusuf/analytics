import { NextResponse } from "next/server";
import { runLocalSync } from "@/lib/sync/local-sync";

export async function POST() {
  try {
    const result = await runLocalSync();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

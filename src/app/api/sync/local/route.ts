export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { runLocalSync } from "@/lib/sync/local-sync";

export async function POST() {
  // Block this in production (Vercel). It's only for your laptop.
  if (process.env.VERCEL) {
    return NextResponse.json(
      { ok: false, error: "Local sync is disabled in production. Use Meta/WeTracked sync instead." },
      { status: 403 }
    );
  }

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
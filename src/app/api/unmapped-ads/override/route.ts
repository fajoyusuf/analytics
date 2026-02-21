import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  adId: z.string().optional(),
  adName: z.string().optional(),
  funnelIdentifierOverride: z.string().optional(),
  creativeIdOverride: z.string().optional(),
  copyIdOverride: z.string().optional(),
  productOverride: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  if (!payload.adId && !payload.adName) {
    return NextResponse.json({ ok: false, error: "adId or adName is required" }, { status: 400 });
  }

  const override = await prisma.manualOverride.upsert({
    where: payload.adId ? { adId: payload.adId } : { adName: payload.adName! },
    update: payload,
    create: payload,
  });

  return NextResponse.json({ ok: true, override });
}

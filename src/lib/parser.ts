export type ParsedAdName = {
  funnelIdentifier: string | null;
  creativeId: string | null;
  copyId: string | null;
  productCode: string | null;
};

export type ParseResult =
  | { ok: true; parsed: ParsedAdName }
  | { ok: false; reason: string; parsed: ParsedAdName };

const FUNNEL_REGEX = /^A\d+$/i;
const CREATIVE_REGEX = /^(IMG\d+\.\d+|V\d+)$/i;
const COPY_REGEX = /^C\d+$/i;
const PRODUCT_REGEX = /^P:([A-Za-z0-9_-]+)$/;

export function parseAdName(adName: string): ParseResult {
  const parsed: ParsedAdName = {
    funnelIdentifier: null,
    creativeId: null,
    copyId: null,
    productCode: null,
  };

  const parts = adName
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (!parsed.funnelIdentifier && FUNNEL_REGEX.test(part)) {
      parsed.funnelIdentifier = part.toUpperCase();
      continue;
    }
    if (!parsed.creativeId && CREATIVE_REGEX.test(part)) {
      parsed.creativeId = part.toUpperCase();
      continue;
    }
    if (!parsed.copyId && COPY_REGEX.test(part)) {
      parsed.copyId = part.toUpperCase();
      continue;
    }
    if (!parsed.productCode && PRODUCT_REGEX.test(part)) {
      parsed.productCode = part;
    }
  }

  if (!parsed.funnelIdentifier || !parsed.creativeId || !parsed.copyId || !parsed.productCode) {
    const missing = [
      !parsed.funnelIdentifier ? "funnel_identifier" : null,
      !parsed.creativeId ? "creative_id" : null,
      !parsed.copyId ? "copy_id" : null,
      !parsed.productCode ? "product_code" : null,
    ].filter(Boolean);

    return {
      ok: false,
      reason: `Missing required token(s): ${missing.join(", ")}`,
      parsed,
    };
  }

  return { ok: true, parsed };
}

export function suggestPartialParse(adName: string): ParsedAdName {
  const tokens = adName
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return {
    funnelIdentifier: tokens.find((token) => FUNNEL_REGEX.test(token))?.toUpperCase() ?? null,
    creativeId: tokens.find((token) => CREATIVE_REGEX.test(token))?.toUpperCase() ?? null,
    copyId: tokens.find((token) => COPY_REGEX.test(token))?.toUpperCase() ?? null,
    productCode: tokens.find((token) => PRODUCT_REGEX.test(token)) ?? null,
  };
}

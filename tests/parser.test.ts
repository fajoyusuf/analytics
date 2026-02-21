import { describe, expect, it } from "vitest";
import { parseAdName, suggestPartialParse } from "@/lib/parser";

describe("parseAdName", () => {
  it("parses valid ad name tokens regardless of spacing", () => {
    const result = parseAdName(" A100 | V356 | C100 | P:AP ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.parsed).toEqual({
        funnelIdentifier: "A100",
        creativeId: "V356",
        copyId: "C100",
        productCode: "P:AP",
      });
    }
  });

  it("parses IMG style creative ids", () => {
    const result = parseAdName("A101 | IMG1.001 | C220 | P:AP");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.parsed.creativeId).toBe("IMG1.001");
    }
  });

  it("returns reason when required tokens are missing", () => {
    const result = parseAdName("A100 | V999 | P:AP");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("copy_id");
    }
  });

  it("suggests partial parse for malformed ad names", () => {
    const partial = suggestPartialParse("foo | V555 | bar | P:AP");
    expect(partial.funnelIdentifier).toBeNull();
    expect(partial.creativeId).toBe("V555");
    expect(partial.productCode).toBe("P:AP");
  });
});

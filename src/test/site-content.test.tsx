import { describe, expect, it } from "vitest";
import { DICTS } from "@/site/i18n";
import { PRODUCTS } from "@/site/config";

describe("RayState content rules", () => {
  it("links each product to its own site and Play listing", () => {
    for (const p of PRODUCTS) {
      expect(p.site).toBe(`https://${p.id}.raystate.com`);
      expect(p.play).toBe(`https://play.google.com/store/apps/details?id=com.raystate.${p.id}`);
    }
  });
  it("never presents Staffly Employee Access as released", () => {
    expect(DICTS.en.products.items.staffly.note).toMatch(/next release/);
    expect(DICTS.fr.products.items.staffly.note).toMatch(/prochaine version/);
    expect(DICTS.ar.products.items.staffly.note).toMatch(/للإصدار القادم/);
  });
});

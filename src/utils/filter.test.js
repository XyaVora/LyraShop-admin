import { describe, expect, it } from "vitest";
import { filterRows } from "./filter.js";

describe("filterRows", () => {
  const rows = [
    { name: "Áo thun Lyra", slug: "ao-thun-lyra" },
    { name: "Quần jean", slug: "quan-jean" }
  ];

  it("returns all rows when query is empty", () => {
    expect(filterRows(rows, "  ", ["name", "slug"])).toEqual(rows);
  });

  it("matches any listed field case-insensitively", () => {
    expect(filterRows(rows, "JEAN", ["name", "slug"]).map((row) => row.slug)).toEqual(["quan-jean"]);
  });
});

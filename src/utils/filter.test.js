import { describe, expect, it } from "vitest";
import { filterRows, paginateRows, sortRows } from "./filter.js";

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

describe("sortRows", () => {
  const rows = [
    { name: "Quần", price: 200, active: false },
    { name: "Áo", price: 50, active: true },
    { name: "Nón", price: 100, active: true }
  ];

  it("sorts numbers and booleans", () => {
    expect(sortRows(rows, "price", "asc").map((row) => row.price)).toEqual([50, 100, 200]);
    expect(sortRows(rows, "active", "desc").map((row) => row.active)).toEqual([true, true, false]);
  });

  it("sorts Vietnamese text", () => {
    expect(sortRows(rows, "name", "asc").map((row) => row.name)).toEqual(["Áo", "Nón", "Quần"]);
  });
});

describe("paginateRows", () => {
  const rows = Array.from({ length: 25 }, (_, index) => ({ id: index + 1 }));

  it("clamps the page and slices the window", () => {
    expect(paginateRows(rows, 2, 10)).toEqual({
      rows: rows.slice(10, 20),
      page: 2,
      pageSize: 10,
      total: 25,
      totalPages: 3
    });
    expect(paginateRows(rows, 99, 10).page).toBe(3);
    expect(paginateRows([], 1, 10).totalPages).toBe(1);
  });
});

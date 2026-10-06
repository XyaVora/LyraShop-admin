import { describe, expect, it, vi } from "vitest";
import { escapeCsvCell, loadAllPages, toCsv } from "./csv.js";

describe("csv export", () => {
  it("quotes cells that contain commas or quotes", () => {
    expect(escapeCsvCell('Áo "Lyra", cotton')).toBe('"Áo ""Lyra"", cotton"');
    expect(toCsv(
      [
        { header: "Tên", value: (row) => row.name },
        { header: "Giá", value: (row) => row.price }
      ],
      [{ name: "Áo, thun", price: 10 }]
    )).toBe("Tên,Giá\n\"Áo, thun\",10");
  });

  it("still emits a header when there are no rows", () => {
    expect(toCsv([{ header: "ID", value: (row) => row.id }], [])).toBe("ID");
  });
});

it("loads every server page for a complete export", async () => {
  const fetchPage = vi.fn(async ({ page }) => ({
    content: page === 0 ? [{ id: 1 }] : [{ id: 2 }],
    totalPages: 2
  }));
  await expect(loadAllPages(fetchPage, { query: "lyra" })).resolves.toEqual([{ id: 1 }, { id: 2 }]);
  expect(fetchPage).toHaveBeenLastCalledWith({ query: "lyra", page: 1, size: 100 });
});

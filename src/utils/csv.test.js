import { describe, expect, it } from "vitest";
import { escapeCsvCell, toCsv } from "./csv.js";

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

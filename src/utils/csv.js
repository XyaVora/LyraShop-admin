export function escapeCsvCell(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(columns, rows) {
  const header = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const body = (rows || []).map((row) => (
    columns.map((column) => escapeCsvCell(column.value(row))).join(",")
  )).join("\n");
  return body ? `${header}\n${body}` : header;
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function loadAllPages(fetchPage, params = {}) {
  const first = await fetchPage({ ...params, page: 0, size: 100 });
  const rows = [...(first.content || [])];
  const totalPages = Math.min(Number(first.totalPages) || 1, 100);
  for (let page = 1; page < totalPages; page += 1) {
    const result = await fetchPage({ ...params, page, size: 100 });
    rows.push(...(result.content || []));
  }
  return rows;
}

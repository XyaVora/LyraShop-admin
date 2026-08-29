export function filterRows(rows, query, fields) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) {
    return rows;
  }
  return rows.filter((row) => fields.some((field) => {
    const value = row?.[field];
    return value != null && String(value).toLowerCase().includes(needle);
  }));
}

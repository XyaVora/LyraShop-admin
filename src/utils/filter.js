export const PAGE_SIZES = [10, 20, 50];

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

export function compareValues(left, right) {
  if (left == null && right == null) {
    return 0;
  }
  if (left == null) {
    return 1;
  }
  if (right == null) {
    return -1;
  }
  if (typeof left === "number" && typeof right === "number") {
    return left === right ? 0 : (left < right ? -1 : 1);
  }
  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }
  return String(left).localeCompare(String(right), "vi", { numeric: true, sensitivity: "base" });
}

export function sortRows(rows, key, direction = "asc") {
  if (!Array.isArray(rows) || rows.length === 0 || !key) {
    return Array.isArray(rows) ? rows : [];
  }
  const dir = direction === "desc" ? -1 : 1;
  return [...rows].sort((left, right) => compareValues(left?.[key], right?.[key]) * dir);
}

export function paginateRows(rows, page, pageSize) {
  const list = Array.isArray(rows) ? rows : [];
  const size = PAGE_SIZES.includes(Number(pageSize)) ? Number(pageSize) : PAGE_SIZES[0];
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / size) || 1);
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (current - 1) * size;
  return {
    rows: list.slice(start, start + size),
    page: current,
    pageSize: size,
    total,
    totalPages
  };
}

import { useMemo, useState } from "react";
import { PAGE_SIZES, filterRows, paginateRows, sortRows } from "../utils/filter.js";

export function useListView(rows, {
  fields = [],
  defaultSortKey,
  defaultSortDir = "asc",
  pageSize: initialPageSize = PAGE_SIZES[0],
  extraFilter
} = {}) {
  const [queryText, setQueryTextState] = useState("");
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  function setQueryText(value) {
    setQueryTextState(value);
    setPageState(1);
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPageState(1);
  }

  function setPage(value) {
    setPageState(value);
  }

  function setPageSize(value) {
    setPageSizeState(value);
    setPageState(1);
  }

  const filtered = useMemo(() => {
    const searched = filterRows(rows || [], queryText, fields);
    return extraFilter ? searched.filter(extraFilter) : searched;
  }, [rows, queryText, fields, extraFilter]);

  const sorted = useMemo(
    () => sortRows(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  const pageState = useMemo(
    () => paginateRows(sorted, page, pageSize),
    [sorted, page, pageSize]
  );

  return {
    queryText,
    setQueryText,
    sortKey,
    sortDir,
    toggleSort,
    page: pageState.page,
    pageSize: pageState.pageSize,
    total: pageState.total,
    totalPages: pageState.totalPages,
    rows: pageState.rows,
    allRows: sorted,
    setPage,
    setPageSize
  };
}

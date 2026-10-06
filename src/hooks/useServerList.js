import { useEffect, useMemo, useState } from "react";
import { PAGE_SIZES } from "../utils/filter.js";

export function useServerList({ defaultSortKey, defaultSortDir = "asc" } = {}) {
  const [queryText, setQueryTextState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(PAGE_SIZES[0]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(queryText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [queryText]);

  function setQueryText(value) {
    setQueryTextState(value);
    setPageState(1);
  }

  function toggleSort(key) {
    if (sortKey === key) setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPageState(1);
  }

  function setPageSize(value) {
    setPageSizeState(PAGE_SIZES.includes(Number(value)) ? Number(value) : PAGE_SIZES[0]);
    setPageState(1);
  }

  const request = useMemo(() => ({
    page: page - 1,
    size: pageSize,
    query: debouncedQuery || undefined,
    sort: sortKey,
    direction: sortDir
  }), [page, pageSize, debouncedQuery, sortKey, sortDir]);

  return {
    queryText, setQueryText, sortKey, sortDir, toggleSort,
    page, setPage: setPageState, pageSize, setPageSize, request
  };
}

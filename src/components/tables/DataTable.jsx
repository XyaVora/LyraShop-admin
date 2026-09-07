import EmptyState from "../common/EmptyState.jsx";

export default function DataTable({
  columns,
  rows,
  rowKey,
  emptyTitle = "Không có dữ liệu",
  emptyDescription,
  onRowClick,
  sortKey,
  sortDir,
  onSort
}) {
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            {columns.map((column) => {
              const sortable = Boolean(column.sortable && onSort);
              const active = sortable && sortKey === column.key;
              return (
                <th key={column.key} scope="col" aria-sort={active ? (sortDir === "desc" ? "descending" : "ascending") : undefined}>
                  {sortable ? (
                    <button
                      type="button"
                      className={`table-sort${active ? " is-active" : ""}`}
                      onClick={() => onSort(column.key)}
                    >
                      {column.header}
                      {active ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                    </button>
                  ) : column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={onRowClick ? "table-row-clickable" : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  onClick={column.stopRowClick ? (event) => event.stopPropagation() : undefined}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { PAGE_SIZES } from "../../utils/filter.js";

export default function PaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange
}) {
  if (!total) {
    return null;
  }
  return (
    <div className="pagination-bar d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 py-2">
      <div className="small text-secondary">
        {total} mục · trang {page}/{totalPages}
      </div>
      <div className="d-flex align-items-center gap-2">
        <label className="small text-secondary mb-0 d-flex align-items-center gap-2">
          <span className="visually-hidden">Số dòng mỗi trang</span>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}/trang</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Trước
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}

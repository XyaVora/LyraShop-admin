import { downloadCsv, toCsv } from "../../utils/csv.js";

export default function ExportCsvButton({ filename, columns, rows }) {
  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      disabled={!rows?.length}
      onClick={() => downloadCsv(filename, toCsv(columns, rows))}
    >
      Xuất CSV
    </button>
  );
}

import { useState } from "react";
import { downloadCsv, toCsv } from "../../utils/csv.js";

export default function ExportCsvButton({ filename, columns, rows, loadRows }) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  async function exportRows() {
    setLoading(true);
    setFailed(false);
    try {
      const exportData = loadRows ? await loadRows() : rows;
      downloadCsv(filename, toCsv(columns, exportData));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }
  return <>
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      disabled={loading || (!loadRows && !rows?.length)}
      onClick={exportRows}
      aria-describedby={failed ? `${filename}-export-error` : undefined}
    >
      {loading ? "Đang xuất..." : loadRows ? "Xuất toàn bộ CSV" : "Xuất CSV"}
    </button>
    {failed && <span id={`${filename}-export-error`} className="small text-danger">Không thể xuất dữ liệu.</span>}
  </>;
}

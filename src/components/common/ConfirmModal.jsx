import { useEffect, useId, useRef } from "react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  danger = false,
  onConfirm,
  onCancel
}) {
  const titleId = useId();
  const messageId = useId();
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previousFocus = document.activeElement;
    cancelButtonRef.current?.focus();
    function onKey(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previousFocus?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="confirm-layer" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-body">
          <h2 id={titleId} className="h6">{title}</h2>
          <p id={messageId} className="text-secondary small mb-4">{message}</p>
          <div className="d-flex justify-content-end gap-2">
            <button ref={cancelButtonRef} type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${danger ? "btn-danger" : "btn-lyra"}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

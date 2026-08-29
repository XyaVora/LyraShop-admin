import { useToastStore } from "../../store/toastStore.js";

export default function ToastHost() {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          className={`app-toast app-toast-${item.tone}`}
          onClick={() => dismiss(item.id)}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}

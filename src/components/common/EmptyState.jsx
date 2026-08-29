export default function EmptyState({ title, description }) {
  return (
    <div className="empty-state text-center py-5 px-3">
      <p className="fw-semibold mb-1">{title}</p>
      {description && <p className="text-secondary mb-0">{description}</p>}
    </div>
  );
}

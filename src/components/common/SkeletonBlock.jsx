export default function SkeletonBlock({ rows = 4 }) {
  return (
    <div className="d-flex flex-column gap-2" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton-line" />
      ))}
    </div>
  );
}

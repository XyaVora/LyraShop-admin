export default function StatusBadge({ label, className }) {
  return <span className={`badge ${className}`}>{label}</span>;
}

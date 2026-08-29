export default function StatusBadge({ label, className }) {
  return <span className={`badge rounded-pill ${className}`}>{label}</span>;
}

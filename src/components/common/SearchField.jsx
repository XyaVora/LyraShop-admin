import { Search } from "lucide-react";

export default function SearchField({ value, onChange, placeholder = "Tìm kiếm..." }) {
  return (
    <label className="search-field">
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        className="form-control"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

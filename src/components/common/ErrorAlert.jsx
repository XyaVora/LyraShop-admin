import { formatApiError, parseApiError } from "../../services/api/errors.js";

export default function ErrorAlert({ error, problem }) {
  const parsed = problem || (error ? parseApiError(error) : null);
  if (!parsed) {
    return null;
  }
  const fields = Object.entries(parsed.fieldErrors || {});
  return (
    <div className="alert alert-danger" role="alert">
      <div className="fw-semibold">{formatApiError(parsed)}</div>
      {fields.length > 0 && (
        <ul className="mb-0 mt-2">
          {fields.map(([field, message]) => (
            <li key={field}>
              <code>{field}</code>: {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

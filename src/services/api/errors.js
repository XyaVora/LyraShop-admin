export function parseApiError(error) {
  const response = error && error.response;
  const data = response && response.data;
  if (data && typeof data === "object" && (data.code || data.message)) {
    return {
      status: data.status ?? response.status,
      code: data.code || "UNKNOWN",
      message: data.message || "Request failed",
      path: data.path,
      fieldErrors: data.fieldErrors && typeof data.fieldErrors === "object"
        ? data.fieldErrors
        : {}
    };
  }
  if (response) {
    return {
      status: response.status,
      code: response.status === 401 ? "UNAUTHORIZED" : "REQUEST_FAILED",
      message: "Request failed",
      path: undefined,
      fieldErrors: {}
    };
  }
  return {
    status: 0,
    code: "NETWORK_ERROR",
    message: error && error.message ? error.message : "Network error",
    path: undefined,
    fieldErrors: {}
  };
}

export function formatApiError(problem) {
  const fields = Object.entries(problem.fieldErrors || {})
    .map(([field, message]) => `${field}: ${message}`)
    .join("; ");
  if (fields) {
    return `${problem.code}: ${problem.message} (${fields})`;
  }
  return `${problem.code}: ${problem.message}`;
}

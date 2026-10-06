function decodeBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const normalized = padded + "=".repeat(padLength);
  const decoded = atob(normalized);
  return decodeURIComponent(
    Array.from(decoded, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
  );
}

export function decodeJwtPayload(accessToken) {
  if (typeof accessToken !== "string" || accessToken.split(".").length < 2) {
    throw new Error("Access token is malformed");
  }
  const payloadPart = accessToken.split(".")[1];
  try {
    return JSON.parse(decodeBase64Url(payloadPart));
  } catch {
    throw new Error("Access token payload is invalid");
  }
}

export function readJwtRoles(accessToken) {
  const payload = decodeJwtPayload(accessToken);
  return Array.isArray(payload.roles) ? payload.roles : [];
}

export function isAdminRoleSet(roles) {
  return Array.isArray(roles) && roles.length === 1
    && ["ADMIN", "CATALOG_MANAGER", "ORDER_MANAGER", "SUPPORT"].includes(roles[0]);
}

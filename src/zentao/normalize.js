export function normalizeResult(payload) {
  return { status: 1, msg: "success", result: payload };
}

export function normalizeError(message, payload) {
  return { status: 0, msg: message || "error", result: payload ?? [] };
}

export function toInt(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function normalizeAccountValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function extractAccounts(value) {
  if (value === undefined || value === null) return [];
  if (typeof value === "string" || typeof value === "number") {
    const normalized = normalizeAccountValue(value);
    return normalized ? [normalized] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => extractAccounts(item));
  }
  if (typeof value === "object") {
    if (value.account) return extractAccounts(value.account);
    if (value.user) return extractAccounts(value.user);
    if (value.name) return extractAccounts(value.name);
    if (value.realname) return extractAccounts(value.realname);
    return [];
  }
  return [];
}

export function matchesAccount(value, matchAccount) {
  const candidates = extractAccounts(value);
  return candidates.includes(matchAccount);
}

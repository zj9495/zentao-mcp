import { normalizeResult, normalizeError, toInt } from "./normalize.js";

export async function listPrograms(client, { limit }) {
  const payload = await client.request({
    method: "GET",
    path: "/api.php/v1/programs",
    query: {
      limit: toInt(limit, 1000),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

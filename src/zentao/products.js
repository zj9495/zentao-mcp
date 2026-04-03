import { normalizeResult, normalizeError, toInt } from "./normalize.js";

export async function listProducts(client, { page, limit }) {
  const payload = await client.request({
    method: "GET",
    path: "/api.php/v1/products",
    query: {
      page: toInt(page, 1),
      limit: toInt(limit, 1000),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

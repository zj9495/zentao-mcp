import {
  normalizeResult,
  normalizeError,
  toInt,
} from "./normalize.js";

export async function listReleases(client, { product, page, limit }) {
  if (!product) throw new Error("product is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/products/${product}/releases`,
    query: {
      limit: toInt(limit, 20),
      page: toInt(page, 1),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function getRelease(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/releases/${id}`,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

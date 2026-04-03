import {
  normalizeResult,
  normalizeError,
  toInt,
} from "./normalize.js";

export async function listTestsuites(client, { product, page, limit }) {
  if (!product) throw new Error("product is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/products/${product}/testsuites`,
    query: {
      limit: toInt(limit, 20),
      page: toInt(page, 1),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function getTestsuite(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/testsuites/${id}`,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

import {
  normalizeResult,
  normalizeError,
  toInt,
} from "./normalize.js";

export async function listStories(client, { product, page, limit }) {
  if (!product) throw new Error("product is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/products/${product}/stories`,
    query: {
      limit: toInt(limit, 20),
      page: toInt(page, 1),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function getStory(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/stories/${id}`,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function createStory(client, { product, title, spec, pri, estimate, type, assignedTo }) {
  if (!product) throw new Error("product is required");
  if (!title) throw new Error("title is required");

  const body = { product: Number(product), title };
  if (spec) body.spec = spec;
  if (pri) body.pri = Number(pri);
  if (estimate) body.estimate = Number(estimate);
  if (type) body.type = type;
  if (assignedTo) body.assignedTo = assignedTo;

  const payload = await client.request({
    method: "POST",
    path: `/api.php/v1/products/${product}/stories`,
    body,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

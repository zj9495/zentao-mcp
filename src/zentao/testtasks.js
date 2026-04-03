import {
  normalizeResult,
  normalizeError,
  toInt,
} from "./normalize.js";

export async function listTesttasks(client, { page, limit }) {
  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/testtasks`,
    query: {
      limit: toInt(limit, 20),
      page: toInt(page, 1),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function getTesttask(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/testtasks/${id}`,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

import { normalizeResult, normalizeError, toInt } from "./normalize.js";

export async function listUsers(client, { page, limit }) {
  const payload = await client.request({
    method: "GET",
    path: "/api.php/v1/users",
    query: {
      page: toInt(page, 1),
      limit: toInt(limit, 20),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function getUser(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/users/${id}`,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

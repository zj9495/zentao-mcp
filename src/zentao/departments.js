import { normalizeResult, normalizeError } from "./normalize.js";

export async function listDepartments(client) {
  const payload = await client.request({
    method: "GET",
    path: "/api.php/v1/departments",
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

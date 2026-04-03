import { normalizeResult, normalizeError, toInt } from "./normalize.js";

export async function listProjects(client, { page, limit }) {
  const payload = await client.request({
    method: "GET",
    path: "/api.php/v1/projects",
    query: {
      page: toInt(page, 1),
      limit: toInt(limit, 1000),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function getProject(client, { id }) {
  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/projects/${id}`,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function listBuilds(client, { project, page, limit }) {
  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/projects/${project}/builds`,
    query: {
      page: toInt(page, 1),
      limit: toInt(limit, 1000),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

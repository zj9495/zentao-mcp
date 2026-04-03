import {
  normalizeResult,
  normalizeError,
  toInt,
} from "./normalize.js";

export async function listTasks(client, { execution, page, limit }) {
  if (!execution) throw new Error("execution is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/executions/${execution}/tasks`,
    query: {
      page: toInt(page, 1),
      limit: toInt(limit, 20),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function getTask(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/tasks/${id}`,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function createTask(client, { execution, name, assignedTo, pri, estimate, type, desc }) {
  if (!execution) throw new Error("execution is required");
  if (!name) throw new Error("name is required");

  const body = { name };
  if (assignedTo) body.assignedTo = assignedTo;
  if (pri) body.pri = Number(pri);
  if (estimate) body.estimate = Number(estimate);
  if (type) body.type = type;
  if (desc) body.desc = desc;

  const payload = await client.request({
    method: "POST",
    path: `/api.php/v1/executions/${execution}/tasks`,
    body,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function startTask(client, { id, consumed, left }) {
  if (!id) throw new Error("id is required");

  const body = {};
  if (consumed !== undefined) body.consumed = Number(consumed);
  if (left !== undefined) body.left = Number(left);

  const payload = await client.request({
    method: "POST",
    path: `/api.php/v1/tasks/${id}/start`,
    body,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function finishTask(client, { id, finishedDate, consumed }) {
  if (!id) throw new Error("id is required");

  const body = {};
  if (finishedDate) body.finishedDate = finishedDate;
  if (consumed !== undefined) body.consumed = Number(consumed);

  const payload = await client.request({
    method: "POST",
    path: `/api.php/v1/tasks/${id}/finish`,
    body,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function closeTask(client, { id, comment }) {
  if (!id) throw new Error("id is required");

  const body = {};
  if (comment) body.comment = comment;

  const payload = await client.request({
    method: "POST",
    path: `/api.php/v1/tasks/${id}/close`,
    body,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function pauseTask(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "POST",
    path: `/api.php/v1/tasks/${id}/pause`,
    body: {},
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

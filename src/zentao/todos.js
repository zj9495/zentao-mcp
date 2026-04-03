import {
  normalizeResult,
  normalizeError,
  toInt,
} from "./normalize.js";

export async function listTodos(client, { page, limit }) {
  const payload = await client.request({
    method: "GET",
    path: "/api.php/v1/todos",
    query: {
      page: toInt(page, 1),
      limit: toInt(limit, 20),
    },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function getTodo(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "GET",
    path: `/api.php/v1/todos/${id}`,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function createTodo(client, { name, type, date, begin, end, pri, desc, assignedTo }) {
  if (!name) throw new Error("name is required");

  const body = { name, type: type || "custom" };
  if (date) body.date = date;
  if (begin) body.begin = begin;
  if (end) body.end = end;
  if (pri) body.pri = Number(pri);
  if (desc) body.desc = desc;
  if (assignedTo) body.assignedTo = assignedTo;

  const payload = await client.request({
    method: "POST",
    path: "/api.php/v1/todos",
    body,
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function finishTodo(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "PUT",
    path: `/api.php/v1/todos/${id}`,
    body: { status: "done" },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

export async function closeTodo(client, { id }) {
  if (!id) throw new Error("id is required");

  const payload = await client.request({
    method: "PUT",
    path: `/api.php/v1/todos/${id}`,
    body: { status: "closed" },
  });

  if (payload.error) return normalizeError(payload.error, payload);
  return normalizeResult(payload);
}

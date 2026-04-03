import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listTodos, getTodo, createTodo, finishTodo, closeTodo } from "../zentao/todos.js";

function printHelp() {
  process.stdout.write(`zentao todos - view and manage todos\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao todos list [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao todos get --id <todoId> [--json]\n`);
  process.stdout.write(`  zentao todos create --name "..." [--type custom] [--date 2025-01-01] [--pri N] [--begin HH:MM] [--end HH:MM] [--desc "..."] [--assigned-to <account>] [--json]\n`);
  process.stdout.write(`  zentao todos finish --id <todoId> [--json]\n`);
  process.stdout.write(`  zentao todos close --id <todoId> [--json]\n`);
}

function formatAccount(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return String(value.account || value.name || value.realname || "");
  return "";
}

export function formatTodosSimple(todos) {
  const rows = [];
  rows.push(["id", "name", "type", "status", "pri", "date", "assignedTo"].join("\t"));
  for (const todo of todos) {
    rows.push(
      [
        String(todo?.id ?? ""),
        String(todo?.name ?? ""),
        String(todo?.type ?? ""),
        String(todo?.status ?? ""),
        String(todo?.pri ?? ""),
        String(todo?.date ?? ""),
        formatAccount(todo?.assignedTo),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export function formatTodoSimple(todo) {
  const header = [
    "id",
    "name",
    "type",
    "status",
    "pri",
    "date",
    "assignedTo",
  ].join("\t");
  const row = [
    String(todo?.id ?? ""),
    String(todo?.name ?? ""),
    String(todo?.type ?? ""),
    String(todo?.status ?? ""),
    String(todo?.pri ?? ""),
    String(todo?.date ?? ""),
    formatAccount(todo?.assignedTo),
  ].join("\t");
  return `${header}\n${row}\n`;
}

export async function runTodos({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);

  if (sub === "list") {
    return runTodosList(cliArgs, argvWithoutSub, env);
  }
  if (sub === "get") {
    return runTodosGet(cliArgs, argvWithoutSub, env);
  }
  if (sub === "create") {
    return runTodosCreate(cliArgs, argvWithoutSub, env);
  }
  if (sub === "finish") {
    return runTodosFinish(cliArgs, argvWithoutSub, env);
  }
  if (sub === "close") {
    return runTodosClose(cliArgs, argvWithoutSub, env);
  }

  throw new Error(`Unknown todos subcommand: ${sub || "(missing)"}`);
}

async function runTodosList(cliArgs, argv, env) {
  const api = createClientFromCli({ argv, env });
  const result = await listTodos(api, {
    page: cliArgs.page,
    limit: cliArgs.limit,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const todos = result?.result?.todos;
  if (!Array.isArray(todos)) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatTodosSimple(todos));
}

async function runTodosGet(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await getTodo(api, { id });
  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const todo = result?.result?.todo ?? result?.result;
  if (!todo || typeof todo !== "object") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatTodoSimple(todo));
}

async function runTodosCreate(cliArgs, argv, env) {
  const name = cliArgs.name;
  if (!name) throw new Error("Missing --name");

  const api = createClientFromCli({ argv, env });
  const result = await createTodo(api, {
    name,
    type: cliArgs.type,
    date: cliArgs.date,
    begin: cliArgs.begin,
    end: cliArgs.end,
    pri: cliArgs.pri,
    desc: cliArgs.desc,
    assignedTo: cliArgs["assigned-to"],
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const todo = result.result;
    process.stdout.write(`Todo #${todo.id} created: ${todo.name}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

async function runTodosFinish(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await finishTodo(api, { id });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const todo = result.result;
    process.stdout.write(`Todo #${todo.id ?? id} finished\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

async function runTodosClose(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await closeTodo(api, { id });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const todo = result.result;
    process.stdout.write(`Todo #${todo.id ?? id} closed\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

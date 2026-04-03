import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { getTask, createTask, startTask, finishTask, closeTask, pauseTask } from "../zentao/tasks.js";

function printHelp() {
  process.stdout.write(`zentao task - view and manage tasks\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao task get --id <taskId> [--json]\n`);
  process.stdout.write(`  zentao task create --execution <id> --name "..." [--assigned-to <account>] [--pri N] [--estimate N] [--type devel|test|design|...] [--desc "..."] [--json]\n`);
  process.stdout.write(`  zentao task start --id <taskId> [--consumed N] [--left N] [--json]\n`);
  process.stdout.write(`  zentao task finish --id <taskId> [--finished-date "YYYY-MM-DD"] [--consumed N] [--json]\n`);
  process.stdout.write(`  zentao task close --id <taskId> [--comment "..."] [--json]\n`);
  process.stdout.write(`  zentao task pause --id <taskId> [--json]\n`);
}

function formatAccount(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return String(value.account || value.name || value.realname || "");
  return "";
}

export function formatTaskSimple(task) {
  const header = [
    "id",
    "name",
    "status",
    "pri",
    "assignedTo",
    "estimate",
    "consumed",
    "left",
  ].join("\t");
  const row = [
    String(task?.id ?? ""),
    String(task?.name ?? ""),
    String(task?.status ?? ""),
    String(task?.pri ?? ""),
    formatAccount(task?.assignedTo),
    String(task?.estimate ?? ""),
    String(task?.consumed ?? ""),
    String(task?.left ?? ""),
  ].join("\t");
  return `${header}\n${row}\n`;
}

export async function runTask({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);

  if (sub === "get") {
    return runTaskGet(cliArgs, argvWithoutSub, env);
  }
  if (sub === "create") {
    return runTaskCreate(cliArgs, argvWithoutSub, env);
  }
  if (sub === "start") {
    return runTaskStart(cliArgs, argvWithoutSub, env);
  }
  if (sub === "finish") {
    return runTaskFinish(cliArgs, argvWithoutSub, env);
  }
  if (sub === "close") {
    return runTaskClose(cliArgs, argvWithoutSub, env);
  }
  if (sub === "pause") {
    return runTaskPause(cliArgs, argvWithoutSub, env);
  }

  throw new Error(`Unknown task subcommand: ${sub || "(missing)"}`);
}

async function runTaskGet(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await getTask(api, { id });
  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const task = result?.result?.task ?? result?.result;
  if (!task || typeof task !== "object") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatTaskSimple(task));
}

async function runTaskCreate(cliArgs, argv, env) {
  const execution = cliArgs.execution;
  if (!execution) throw new Error("Missing --execution");
  const name = cliArgs.name;
  if (!name) throw new Error("Missing --name");

  const api = createClientFromCli({ argv, env });
  const result = await createTask(api, {
    execution,
    name,
    assignedTo: cliArgs["assigned-to"],
    pri: cliArgs.pri,
    estimate: cliArgs.estimate,
    type: cliArgs.type,
    desc: cliArgs.desc,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const task = result.result;
    process.stdout.write(`Task #${task.id} created: ${task.name}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

async function runTaskStart(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await startTask(api, {
    id,
    consumed: cliArgs.consumed,
    left: cliArgs.left,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const task = result.result;
    process.stdout.write(`Task #${task.id ?? id} started\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

async function runTaskFinish(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await finishTask(api, {
    id,
    finishedDate: cliArgs["finished-date"],
    consumed: cliArgs.consumed,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const task = result.result;
    process.stdout.write(`Task #${task.id ?? id} finished\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

async function runTaskClose(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await closeTask(api, {
    id,
    comment: cliArgs.comment,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const task = result.result;
    process.stdout.write(`Task #${task.id ?? id} closed\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

async function runTaskPause(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await pauseTask(api, { id });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const task = result.result;
    process.stdout.write(`Task #${task.id ?? id} paused\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

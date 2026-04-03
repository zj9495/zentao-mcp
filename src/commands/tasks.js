import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listTasks } from "../zentao/tasks.js";

function printHelp() {
  process.stdout.write(`zentao tasks <subcommand>\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao tasks list --execution <id> [--page N] [--limit N] [--json]\n`);
}

function formatAccount(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return String(value.account || value.name || value.realname || "");
  return "";
}

export function formatTasksSimple(tasks) {
  const rows = [];
  rows.push(["id", "name", "status", "pri", "assignedTo", "estimate", "consumed", "left"].join("\t"));
  for (const task of tasks) {
    rows.push(
      [
        String(task?.id ?? ""),
        String(task?.name ?? ""),
        String(task?.status ?? ""),
        String(task?.pri ?? ""),
        formatAccount(task?.assignedTo),
        String(task?.estimate ?? ""),
        String(task?.consumed ?? ""),
        String(task?.left ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runTasks({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });

  if (sub === "list") {
    const execution = cliArgs.execution;
    if (!execution) throw new Error("Missing --execution");
    const result = await listTasks(api, {
      execution,
      page: cliArgs.page,
      limit: cliArgs.limit,
    });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const tasks = result?.result?.tasks;
    if (!Array.isArray(tasks)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatTasksSimple(tasks));
    return;
  }

  throw new Error(`Unknown tasks subcommand: ${sub || "(missing)"}`);
}

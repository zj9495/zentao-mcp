import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listExecutions } from "../zentao/executions.js";

function printHelp() {
  process.stdout.write(`zentao executions list\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao executions list [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`\n`);
  process.stdout.write(`Options:\n`);
  process.stdout.write(`  --json               print full JSON payload\n`);
}

export function formatExecutionsSimple(executions) {
  const rows = [];
  rows.push(["id", "name", "status", "begin", "end"].join("\t"));
  for (const exec of executions) {
    rows.push(
      [
        String(exec.id ?? ""),
        String(exec.name ?? ""),
        String(exec.status ?? ""),
        String(exec.begin ?? ""),
        String(exec.end ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runExecutions({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  if (sub !== "list") throw new Error(`Unknown executions subcommand: ${sub || "(missing)"}`);

  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });
  const result = await listExecutions(api, {
    page: cliArgs.page,
    limit: cliArgs.limit,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const executions = result?.result?.executions;
  if (!Array.isArray(executions)) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatExecutionsSimple(executions));
}

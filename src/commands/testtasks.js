import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listTesttasks, getTesttask } from "../zentao/testtasks.js";

function printHelp() {
  process.stdout.write(`zentao testtasks <subcommand>\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao testtasks list [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao testtasks get --id <id> [--json]\n`);
}

export function formatTesttasksSimple(testtasks) {
  const rows = [];
  rows.push(["id", "name", "build", "status", "begin", "end"].join("\t"));
  for (const tt of testtasks) {
    rows.push(
      [
        String(tt?.id ?? ""),
        String(tt?.name ?? ""),
        String(tt?.build ?? ""),
        String(tt?.status ?? ""),
        String(tt?.begin ?? ""),
        String(tt?.end ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runTesttasks({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });

  if (sub === "list") {
    const result = await listTesttasks(api, {
      page: cliArgs.page,
      limit: cliArgs.limit,
    });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const testtasks = result?.result?.testtasks;
    if (!Array.isArray(testtasks)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatTesttasksSimple(testtasks));
    return;
  }

  if (sub === "get") {
    const id = cliArgs.id;
    if (!id) throw new Error("Missing --id");
    const result = await getTesttask(api, { id });

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  throw new Error(`Unknown testtasks subcommand: ${sub || "(missing)"}`);
}

import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listDepartments } from "../zentao/departments.js";

function printHelp() {
  process.stdout.write(`zentao departments list\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao departments list [--json]\n`);
  process.stdout.write(`\n`);
  process.stdout.write(`Options:\n`);
  process.stdout.write(`  --json               print full JSON payload\n`);
}

export function formatDepartmentsSimple(departments) {
  const rows = [];
  rows.push(["id", "name", "parent", "path", "manager"].join("\t"));
  for (const dept of departments) {
    rows.push(
      [
        String(dept.id ?? ""),
        String(dept.name ?? ""),
        String(dept.parent ?? ""),
        String(dept.path ?? ""),
        String(dept.manager ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runDepartments({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  if (sub !== "list") throw new Error(`Unknown departments subcommand: ${sub || "(missing)"}`);

  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });
  const result = await listDepartments(api);

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const departments = result?.result;
  if (!Array.isArray(departments)) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatDepartmentsSimple(departments));
}

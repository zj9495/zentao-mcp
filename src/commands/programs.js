import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listPrograms } from "../zentao/programs.js";

function printHelp() {
  process.stdout.write(`zentao programs list\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao programs list [--limit N] [--json]\n`);
  process.stdout.write(`\n`);
  process.stdout.write(`Options:\n`);
  process.stdout.write(`  --json               print full JSON payload\n`);
}

export function formatProgramsSimple(programs) {
  const rows = [];
  rows.push(["id", "name", "status"].join("\t"));
  for (const program of programs) {
    rows.push(
      [
        String(program.id ?? ""),
        String(program.name ?? ""),
        String(program.status ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runPrograms({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  if (sub !== "list") throw new Error(`Unknown programs subcommand: ${sub || "(missing)"}`);

  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });
  const result = await listPrograms(api, {
    limit: cliArgs.limit,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const programs = result?.result?.programs ?? result?.result;
  if (!Array.isArray(programs)) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatProgramsSimple(programs));
}

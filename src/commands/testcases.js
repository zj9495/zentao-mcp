import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listTestcases, getTestcase } from "../zentao/testcases.js";

function printHelp() {
  process.stdout.write(`zentao testcases <subcommand>\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao testcases list --product <id> [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao testcases get --id <id> [--json]\n`);
}

export function formatTestcasesSimple(testcases) {
  const rows = [];
  rows.push(["id", "title", "type", "pri", "status", "lastRunner", "lastRunResult"].join("\t"));
  for (const tc of testcases) {
    rows.push(
      [
        String(tc?.id ?? ""),
        String(tc?.title ?? ""),
        String(tc?.type ?? ""),
        String(tc?.pri ?? ""),
        String(tc?.status ?? ""),
        String(tc?.lastRunner ?? ""),
        String(tc?.lastRunResult ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runTestcases({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });

  if (sub === "list") {
    const product = cliArgs.product;
    if (!product) throw new Error("Missing --product");
    const result = await listTestcases(api, {
      product,
      page: cliArgs.page,
      limit: cliArgs.limit,
    });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const testcases = result?.result?.testcases;
    if (!Array.isArray(testcases)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatTestcasesSimple(testcases));
    return;
  }

  if (sub === "get") {
    const id = cliArgs.id;
    if (!id) throw new Error("Missing --id");
    const result = await getTestcase(api, { id });

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  throw new Error(`Unknown testcases subcommand: ${sub || "(missing)"}`);
}

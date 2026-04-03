import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listTestsuites, getTestsuite } from "../zentao/testsuites.js";

function printHelp() {
  process.stdout.write(`zentao testsuites <subcommand>\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao testsuites list --product <id> [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao testsuites get --id <id> [--json]\n`);
}

export function formatTestsuitesSimple(testsuites) {
  const rows = [];
  rows.push(["id", "name", "type", "addedBy"].join("\t"));
  for (const ts of testsuites) {
    rows.push(
      [
        String(ts?.id ?? ""),
        String(ts?.name ?? ""),
        String(ts?.type ?? ""),
        String(ts?.addedBy ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runTestsuites({ argv = [], env = process.env } = {}) {
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
    const result = await listTestsuites(api, {
      product,
      page: cliArgs.page,
      limit: cliArgs.limit,
    });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const testsuites = result?.result?.testsuites;
    if (!Array.isArray(testsuites)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatTestsuitesSimple(testsuites));
    return;
  }

  if (sub === "get") {
    const id = cliArgs.id;
    if (!id) throw new Error("Missing --id");
    const result = await getTestsuite(api, { id });

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  throw new Error(`Unknown testsuites subcommand: ${sub || "(missing)"}`);
}

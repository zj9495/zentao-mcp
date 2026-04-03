import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listReleases, getRelease } from "../zentao/releases.js";

function printHelp() {
  process.stdout.write(`zentao releases <subcommand>\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao releases list --product <id> [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao releases get --id <id> [--json]\n`);
}

export function formatReleasesSimple(releases) {
  const rows = [];
  rows.push(["id", "name", "product", "build", "date", "status"].join("\t"));
  for (const release of releases) {
    rows.push(
      [
        String(release?.id ?? ""),
        String(release?.name ?? ""),
        String(release?.product ?? ""),
        String(release?.build ?? ""),
        String(release?.date ?? ""),
        String(release?.status ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runReleases({ argv = [], env = process.env } = {}) {
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
    const result = await listReleases(api, {
      product,
      page: cliArgs.page,
      limit: cliArgs.limit,
    });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const releases = result?.result?.releases;
    if (!Array.isArray(releases)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatReleasesSimple(releases));
    return;
  }

  if (sub === "get") {
    const id = cliArgs.id;
    if (!id) throw new Error("Missing --id");
    const result = await getRelease(api, { id });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  throw new Error(`Unknown releases subcommand: ${sub || "(missing)"}`);
}

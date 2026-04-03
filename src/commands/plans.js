import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listPlans, getPlan } from "../zentao/plans.js";

function printHelp() {
  process.stdout.write(`zentao plans <subcommand>\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao plans list --product <id> [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao plans get --id <id> [--json]\n`);
}

export function formatPlansSimple(plans) {
  const rows = [];
  rows.push(["id", "title", "status", "begin", "end"].join("\t"));
  for (const plan of plans) {
    rows.push(
      [
        String(plan?.id ?? ""),
        String(plan?.title ?? ""),
        String(plan?.status ?? ""),
        String(plan?.begin ?? ""),
        String(plan?.end ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runPlans({ argv = [], env = process.env } = {}) {
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
    const result = await listPlans(api, {
      product,
      page: cliArgs.page,
      limit: cliArgs.limit,
    });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const plans = result?.result?.plans;
    if (!Array.isArray(plans)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatPlansSimple(plans));
    return;
  }

  if (sub === "get") {
    const id = cliArgs.id;
    if (!id) throw new Error("Missing --id");
    const result = await getPlan(api, { id });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  throw new Error(`Unknown plans subcommand: ${sub || "(missing)"}`);
}

import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listStories } from "../zentao/stories.js";

function printHelp() {
  process.stdout.write(`zentao stories <subcommand>\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao stories list --product <id> [--page N] [--limit N] [--json]\n`);
}

function formatAccount(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return String(value.account || value.name || value.realname || "");
  return "";
}

export function formatStoriesSimple(stories) {
  const rows = [];
  rows.push(["id", "title", "status", "stage", "pri", "estimate", "assignedTo"].join("\t"));
  for (const story of stories) {
    rows.push(
      [
        String(story?.id ?? ""),
        String(story?.title ?? ""),
        String(story?.status ?? ""),
        String(story?.stage ?? ""),
        String(story?.pri ?? ""),
        String(story?.estimate ?? ""),
        formatAccount(story?.assignedTo),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runStories({ argv = [], env = process.env } = {}) {
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
    const result = await listStories(api, {
      product,
      page: cliArgs.page,
      limit: cliArgs.limit,
    });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const stories = result?.result?.stories;
    if (!Array.isArray(stories)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatStoriesSimple(stories));
    return;
  }

  throw new Error(`Unknown stories subcommand: ${sub || "(missing)"}`);
}

import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { getStory, createStory } from "../zentao/stories.js";

function printHelp() {
  process.stdout.write(`zentao story - view and manage stories\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao story get --id <storyId> [--json]\n`);
  process.stdout.write(`  zentao story create --product <id> --title "..." [--spec "..."] [--pri N] [--estimate N] [--type story|requirement] [--assigned-to <account>] [--json]\n`);
}

function formatAccount(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return String(value.account || value.name || value.realname || "");
  return "";
}

export function formatStorySimple(story) {
  const header = [
    "id",
    "title",
    "status",
    "stage",
    "pri",
    "estimate",
    "assignedTo",
    "openedBy",
  ].join("\t");
  const row = [
    String(story?.id ?? ""),
    String(story?.title ?? ""),
    String(story?.status ?? ""),
    String(story?.stage ?? ""),
    String(story?.pri ?? ""),
    String(story?.estimate ?? ""),
    formatAccount(story?.assignedTo),
    formatAccount(story?.openedBy),
  ].join("\t");
  return `${header}\n${row}\n`;
}

export async function runStory({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);

  if (sub === "get") {
    return runStoryGet(cliArgs, argvWithoutSub, env);
  }
  if (sub === "create") {
    return runStoryCreate(cliArgs, argvWithoutSub, env);
  }

  throw new Error(`Unknown story subcommand: ${sub || "(missing)"}`);
}

async function runStoryGet(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await getStory(api, { id });
  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const story = result?.result?.story ?? result?.result;
  if (!story || typeof story !== "object") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatStorySimple(story));
}

async function runStoryCreate(cliArgs, argv, env) {
  const product = cliArgs.product;
  if (!product) throw new Error("Missing --product");
  const title = cliArgs.title;
  if (!title) throw new Error("Missing --title");

  const api = createClientFromCli({ argv, env });
  const result = await createStory(api, {
    product,
    title,
    spec: cliArgs.spec,
    pri: cliArgs.pri,
    estimate: cliArgs.estimate,
    type: cliArgs.type,
    assignedTo: cliArgs["assigned-to"],
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === 1) {
    const story = result.result;
    process.stdout.write(`Story #${story.id} created: ${story.title}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

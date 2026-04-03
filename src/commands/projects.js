import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listProjects, listBuilds } from "../zentao/projects.js";

function printHelp() {
  process.stdout.write(`zentao projects <subcommand>\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao projects list [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao projects builds --id <projectId> [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`\n`);
  process.stdout.write(`Options:\n`);
  process.stdout.write(`  --json               print full JSON payload\n`);
}

export function formatProjectsSimple(projects) {
  const rows = [];
  rows.push(["id", "name", "status", "begin", "end"].join("\t"));
  for (const project of projects) {
    rows.push(
      [
        String(project.id ?? ""),
        String(project.name ?? ""),
        String(project.status ?? ""),
        String(project.begin ?? ""),
        String(project.end ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export function formatBuildsSimple(builds) {
  const rows = [];
  rows.push(["id", "name", "project", "date"].join("\t"));
  for (const build of builds) {
    rows.push(
      [
        String(build.id ?? ""),
        String(build.name ?? ""),
        String(build.project ?? ""),
        String(build.date ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

async function handleList(argvWithoutSub, env) {
  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });
  const result = await listProjects(api, {
    page: cliArgs.page,
    limit: cliArgs.limit,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const projects = result?.result?.projects;
  if (!Array.isArray(projects)) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatProjectsSimple(projects));
}

async function handleBuilds(argvWithoutSub, env) {
  const cliArgs = parseCliArgs(argvWithoutSub);
  if (!cliArgs.id) throw new Error("Missing required option: --id <projectId>");

  const api = createClientFromCli({ argv: argvWithoutSub, env });
  const result = await listBuilds(api, {
    project: cliArgs.id,
    page: cliArgs.page,
    limit: cliArgs.limit,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const builds = result?.result?.builds;
  if (!Array.isArray(builds)) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatBuildsSimple(builds));
}

export async function runProjects({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);

  switch (sub) {
    case "list":
      await handleList(argvWithoutSub, env);
      break;
    case "builds":
      await handleBuilds(argvWithoutSub, env);
      break;
    default:
      throw new Error(`Unknown projects subcommand: ${sub || "(missing)"}`);
  }
}

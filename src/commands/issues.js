import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listIssues, getIssue } from "../zentao/issues.js";

function printHelp() {
  process.stdout.write(`zentao issues - view issues\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao issues list [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao issues get --id <id> [--json]\n`);
}

function formatAccount(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return String(value.account || value.name || value.realname || "");
  return "";
}

export function formatIssuesSimple(issues) {
  const rows = [];
  rows.push(["id", "title", "severity", "pri", "status", "assignedTo"].join("\t"));
  for (const issue of issues) {
    rows.push(
      [
        String(issue.id ?? ""),
        String(issue.title ?? ""),
        String(issue.severity ?? ""),
        String(issue.pri ?? ""),
        String(issue.status ?? ""),
        formatAccount(issue.assignedTo),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export function formatIssueSimple(issue) {
  const header = ["id", "title", "severity", "pri", "status", "assignedTo"].join("\t");
  const row = [
    String(issue?.id ?? ""),
    String(issue?.title ?? ""),
    String(issue?.severity ?? ""),
    String(issue?.pri ?? ""),
    String(issue?.status ?? ""),
    formatAccount(issue?.assignedTo),
  ].join("\t");
  return `${header}\n${row}\n`;
}

export async function runIssues({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);

  if (sub === "list") {
    return runIssuesList(cliArgs, argvWithoutSub, env);
  }
  if (sub === "get") {
    return runIssuesGet(cliArgs, argvWithoutSub, env);
  }

  throw new Error(`Unknown issues subcommand: ${sub || "(missing)"}`);
}

async function runIssuesList(cliArgs, argv, env) {
  const api = createClientFromCli({ argv, env });
  const result = await listIssues(api, {
    page: cliArgs.page,
    limit: cliArgs.limit,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  // Handle both paginated (object with issues key) and flat array responses
  const payload = result?.result;
  let issues;
  if (Array.isArray(payload)) {
    issues = payload;
  } else if (payload?.issues && Array.isArray(payload.issues)) {
    issues = payload.issues;
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatIssuesSimple(issues));
}

async function runIssuesGet(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await getIssue(api, { id });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const issue = result?.result?.issue ?? result?.result;
  if (!issue || typeof issue !== "object") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatIssueSimple(issue));
}

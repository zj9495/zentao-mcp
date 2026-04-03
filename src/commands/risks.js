import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listRisks, getRisk } from "../zentao/risks.js";

function printHelp() {
  process.stdout.write(`zentao risks - view risks\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao risks list [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`  zentao risks get --id <id> [--json]\n`);
}

function formatAccount(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") return String(value.account || value.name || value.realname || "");
  return "";
}

export function formatRisksSimple(risks) {
  const rows = [];
  rows.push(["id", "name", "pri", "status", "assignedTo"].join("\t"));
  for (const risk of risks) {
    rows.push(
      [
        String(risk.id ?? ""),
        String(risk.name ?? ""),
        String(risk.pri ?? ""),
        String(risk.status ?? ""),
        formatAccount(risk.assignedTo),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export function formatRiskSimple(risk) {
  const header = ["id", "name", "pri", "status", "assignedTo"].join("\t");
  const row = [
    String(risk?.id ?? ""),
    String(risk?.name ?? ""),
    String(risk?.pri ?? ""),
    String(risk?.status ?? ""),
    formatAccount(risk?.assignedTo),
  ].join("\t");
  return `${header}\n${row}\n`;
}

export async function runRisks({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);

  if (sub === "list") {
    return runRisksList(cliArgs, argvWithoutSub, env);
  }
  if (sub === "get") {
    return runRisksGet(cliArgs, argvWithoutSub, env);
  }

  throw new Error(`Unknown risks subcommand: ${sub || "(missing)"}`);
}

async function runRisksList(cliArgs, argv, env) {
  const api = createClientFromCli({ argv, env });
  const result = await listRisks(api, {
    page: cliArgs.page,
    limit: cliArgs.limit,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  // Handle both paginated (object with risks key) and flat array responses
  const payload = result?.result;
  let risks;
  if (Array.isArray(payload)) {
    risks = payload;
  } else if (payload?.risks && Array.isArray(payload.risks)) {
    risks = payload.risks;
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatRisksSimple(risks));
}

async function runRisksGet(cliArgs, argv, env) {
  const id = cliArgs.id;
  if (!id) throw new Error("Missing --id");

  const api = createClientFromCli({ argv, env });
  const result = await getRisk(api, { id });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const risk = result?.result?.risk ?? result?.result;
  if (!risk || typeof risk !== "object") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatRiskSimple(risk));
}

import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listDoclibs, listDocs, getDoc } from "../zentao/docs.js";

function printHelp() {
  process.stdout.write(`zentao docs <subcommand>\n\n`);
  process.stdout.write(`Subcommands:\n`);
  process.stdout.write(`  libs                 list doc libraries\n`);
  process.stdout.write(`  list --lib <libId>   list docs in a library\n`);
  process.stdout.write(`  get  --id <docId>    get a single doc\n`);
  process.stdout.write(`\n`);
  process.stdout.write(`Options:\n`);
  process.stdout.write(`  --json               print full JSON payload\n`);
}

export function formatLibsSimple(libs) {
  const rows = [];
  rows.push(["id", "name", "type", "product", "project"].join("\t"));
  for (const lib of libs) {
    rows.push(
      [
        String(lib.id ?? ""),
        String(lib.name ?? ""),
        String(lib.type ?? ""),
        String(lib.product ?? ""),
        String(lib.project ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export function formatDocsSimple(docs) {
  const rows = [];
  rows.push(["id", "title", "type", "addedBy", "addedDate"].join("\t"));
  for (const doc of docs) {
    rows.push(
      [
        String(doc.id ?? ""),
        String(doc.title ?? ""),
        String(doc.type ?? ""),
        String(doc.addedBy ?? ""),
        String(doc.addedDate ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runDocs({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });

  if (sub === "libs") {
    const result = await listDoclibs(api);

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const libs = result?.result?.libs;
    if (!Array.isArray(libs)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatLibsSimple(libs));
    return;
  }

  if (sub === "list") {
    const result = await listDocs(api, {
      lib: cliArgs.lib,
      page: cliArgs.page,
      limit: cliArgs.limit,
    });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const docs = result?.result?.docs;
    if (!Array.isArray(docs)) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(formatDocsSimple(docs));
    return;
  }

  if (sub === "get") {
    const result = await getDoc(api, { id: cliArgs.id });

    if (cliArgs.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  throw new Error(`Unknown docs subcommand: ${sub || "(missing)"}`);
}

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Buffer } from "node:buffer";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { fetchZentaoFile, inferNameFromFileUrl } from "../zentao/files.js";

function printHelp() {
  process.stdout.write(`zentao files download - download ZenTao files\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao files download --id <fileId> [--output <path>]\n`);
  process.stdout.write(`  zentao files download --url <file-read|file-download URL> [--output <path>]\n`);
}

export function parseContentDispositionFilename(value) {
  if (!value) return null;

  const utf8Match = value.match(/filename\*=utf-8''([^;]+)/i);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);

  const quotedMatch = value.match(/filename="([^"]+)"/i);
  if (quotedMatch) return decodeQuotedFilename(quotedMatch[1]);

  return null;
}

function decodeQuotedFilename(value) {
  if (/%[0-9a-f]{2}/i.test(value)) return decodeURIComponent(value);

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.from(value, "latin1"));
  } catch {
    return value;
  }
}

function getHeader(headers, name) {
  if (!headers) return null;
  return headers.get(name);
}

export function resolveOutputPath({ output, headers, url }) {
  const headerName = parseContentDispositionFilename(getHeader(headers, "content-disposition"));
  const urlName = url ? inferNameFromFileUrl(url) : null;

  if (!output) {
    if (headerName) return path.resolve(process.cwd(), headerName);
    if (urlName) return path.resolve(process.cwd(), urlName);
    throw new Error("output is required when filename is unavailable");
  }

  const resolved = path.resolve(output);
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    if (headerName) return path.join(resolved, headerName);
    if (urlName) return path.join(resolved, urlName);
    throw new Error("filename is unavailable for output directory");
  }

  return resolved;
}

export async function runFiles({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  if (sub !== "download") throw new Error(`Unknown files subcommand: ${sub || "(missing)"}`);

  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });
  const result = await fetchZentaoFile(api, { id: cliArgs.id, url: cliArgs.url });
  const outputPath = resolveOutputPath({
    output: cliArgs.output,
    headers: result.headers,
    url: cliArgs.url,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.buffer);
  process.stdout.write(`Downloaded ${outputPath}\n`);
}

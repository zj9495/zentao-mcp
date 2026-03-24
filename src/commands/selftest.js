import process from "node:process";
import { hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { printSelfTestHelp } from "../cli/help.js";
import { createClientFromCli } from "../zentao/client.js";

export async function runSelfTest({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printSelfTestHelp();
    return;
  }

  const cliArgs = parseCliArgs(argv);
  const expectedRaw = cliArgs.expected ?? null;
  const expected = expectedRaw === null ? null : Number(expectedRaw);

  const api = createClientFromCli({ argv, env });
  const result = await api.bugsMine({
    scope: "assigned",
    status: "active",
    includeDetails: false,
  });

  if (result.status !== 1) {
    const error = new Error(`API error: ${JSON.stringify(result)}`);
    error.exitCode = 1;
    throw error;
  }

  const total = result.result?.total ?? 0;
  process.stdout.write(`assigned active bugs: ${total}\n`);

  const products = result.result?.products ?? [];
  if (Array.isArray(products) && products.length) {
    const summary = products.map((item) => `${item.name}(${item.myBugs})`).join(", ");
    process.stdout.write(`products: ${summary}\n`);
  }

  if (Number.isFinite(expected) && expected !== null) {
    if (total !== expected) {
      const error = new Error(`Expected ${expected}, got ${total}.`);
      error.exitCode = 2;
      throw error;
    }
  }
}

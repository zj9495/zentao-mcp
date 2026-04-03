import process from "node:process";
import { extractCommand, hasHelpFlag, parseCliArgs } from "../cli/args.js";
import { createClientFromCli } from "../zentao/client.js";
import { listUsers } from "../zentao/users.js";

function printHelp() {
  process.stdout.write(`zentao users list\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  zentao users list [--page N] [--limit N] [--json]\n`);
  process.stdout.write(`\n`);
  process.stdout.write(`Options:\n`);
  process.stdout.write(`  --json               print full JSON payload\n`);
}

export function formatUsersSimple(users) {
  const rows = [];
  rows.push(["id", "account", "realname", "role", "dept"].join("\t"));
  for (const user of users) {
    rows.push(
      [
        String(user.id ?? ""),
        String(user.account ?? ""),
        String(user.realname ?? ""),
        String(user.role ?? ""),
        String(user.dept ?? ""),
      ].join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

export async function runUsers({ argv = [], env = process.env } = {}) {
  if (hasHelpFlag(argv)) {
    printHelp();
    return;
  }

  const { command: sub, argv: argvWithoutSub } = extractCommand(argv);
  if (sub !== "list") throw new Error(`Unknown users subcommand: ${sub || "(missing)"}`);

  const cliArgs = parseCliArgs(argvWithoutSub);
  const api = createClientFromCli({ argv: argvWithoutSub, env });
  const result = await listUsers(api, {
    page: cliArgs.page,
    limit: cliArgs.limit,
  });

  if (cliArgs.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const users = result?.result?.users;
  if (!Array.isArray(users)) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatUsersSimple(users));
}

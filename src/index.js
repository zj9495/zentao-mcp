#!/usr/bin/env node
import process from "node:process";
import { extractCommand, hasHelpFlag } from "./cli/args.js";
import { printRootHelp } from "./cli/help.js";
import { runSelfTest } from "./commands/selftest.js";
import { runRelease } from "./commands/release.js";
import { runProducts } from "./commands/products.js";
import { runBugs } from "./commands/bugs.js";
import { runBug } from "./commands/bug.js";
import { runLogin } from "./commands/login.js";
import { runWhoami } from "./commands/whoami.js";
import { runTask } from "./commands/task.js";
import { runTasks } from "./commands/tasks.js";
import { runStory } from "./commands/story.js";
import { runStories } from "./commands/stories.js";
import { runUsers } from "./commands/users.js";
import { runExecutions } from "./commands/executions.js";
import { runPrograms } from "./commands/programs.js";
import { runProjects } from "./commands/projects.js";
import { runTodos } from "./commands/todos.js";
import { runTestcases } from "./commands/testcases.js";
import { runTesttasks } from "./commands/testtasks.js";
import { runTestsuites } from "./commands/testsuites.js";
import { runPlans } from "./commands/plans.js";
import { runReleases } from "./commands/releases.js";
import { runDepartments } from "./commands/departments.js";
import { runDocs } from "./commands/docs.js";
import { runIssues } from "./commands/issues.js";
import { runRisks } from "./commands/risks.js";

const argv = process.argv.slice(2);
const { command, argv: argvWithoutCommand } = extractCommand(argv);

function exitWithError(error) {
  const message = error?.message || String(error);
  process.stderr.write(`${message}\n`);
  process.exit(error?.exitCode || 1);
}

try {
  if (!command || hasHelpFlag(argv)) {
    printRootHelp();
    process.exit(0);
  }

  if (command === "self-test") {
    await runSelfTest({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "release") {
    await runRelease({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "login") {
    await runLogin({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "whoami") {
    await runWhoami({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "products") {
    await runProducts({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "bugs") {
    await runBugs({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "bug") {
    await runBug({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "task") {
    await runTask({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "tasks") {
    await runTasks({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "story") {
    await runStory({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "stories") {
    await runStories({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "users") {
    await runUsers({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "executions") {
    await runExecutions({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "programs") {
    await runPrograms({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "projects") {
    await runProjects({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "todos") {
    await runTodos({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "testcases") {
    await runTestcases({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "testtasks") {
    await runTesttasks({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "testsuites") {
    await runTestsuites({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "plans") {
    await runPlans({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "releases") {
    await runReleases({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "departments") {
    await runDepartments({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "docs") {
    await runDocs({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "issues") {
    await runIssues({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "risks") {
    await runRisks({ argv: argvWithoutCommand, env: process.env });
    process.exit(0);
  }

  if (command === "help") {
    printRootHelp();
    process.exit(0);
  }

  throw new Error(`Unknown subcommand: ${command}`);
} catch (error) {
  exitWithError(error);
}

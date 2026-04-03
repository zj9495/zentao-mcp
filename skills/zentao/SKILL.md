---
name: zentao
description: Use the zentao CLI to manage ZenTao bugs, tasks, stories, todos, users, projects, executions, plans, releases, testcases, docs and more. ZENTAO_URL usually includes /zentao.
homepage: https://www.npmjs.com/package/@leeguoo/zentao-mcp
metadata: {"openclaw":{"emoji":"🐞","install":[{"id":"node","kind":"node","package":"@leeguoo/zentao-mcp","bins":["zentao"],"label":"Install zentao CLI (node)"}]}}
---

# zentao (ZenTao CLI)

## When to use this skill

Use this skill when the user asks to manage anything in ZenTao: bugs, tasks, stories, todos, users, products, projects, executions, plans, releases, test cases, docs, departments, issues, or risks.

## Installation

```bash
pnpm i -g @leeguoo/zentao-mcp
```

## Login

```bash
zentao login --zentao-url="https://zentao.example.com/zentao" --zentao-account="leo" --zentao-password="***"
zentao whoami
```

IMPORTANT: `--zentao-url` usually must include `/zentao`.

## Bug commands

```bash
zentao bugs list --product 6
zentao bugs mine --status active --include-details
zentao bug get --id 1329
zentao bug create --product 6 --title "bug title" [--severity 3] [--pri 2] [--assigned-to account]
zentao bug resolve --id 1329 --resolution fixed [--assigned-to kelly] [--comment "..."]
zentao bug assign --id 1329 --assigned-to rd-yitong [--comment "..."]
zentao bug close --id 1329 [--comment "..."]
zentao bug activate --id 1329 [--assigned-to account] [--comment "..."]
zentao bug comment --id 1329 --comment "已确认，等待修复"
```

Resolution values: `fixed`, `bydesign`, `duplicate`, `postponed`, `notrepro`, `willnotfix`, `tostory`, `external`

## Task commands

```bash
zentao tasks list --execution 25
zentao task get --id 388
zentao task create --execution 25 --name "task name" [--assigned-to account] [--pri 3] [--estimate 8]
zentao task start --id 388 [--consumed 2] [--left 6]
zentao task finish --id 388 [--consumed 8]
zentao task pause --id 388
zentao task close --id 388 [--comment "done"]
```

## Story commands

```bash
zentao stories list --product 3
zentao story get --id 1
zentao story create --product 3 --title "story title" [--spec "description"] [--pri 2]
```

## Todo commands

```bash
zentao todos list
zentao todos get --id 1
zentao todos create --name "todo name" [--type custom] [--date 2025-01-01] [--pri 3]
zentao todos finish --id 1
zentao todos close --id 1
```

## Product plans & releases

```bash
zentao plans list --product 3
zentao plans get --id 1
zentao releases list --product 3
zentao releases get --id 1
```

## Testing commands

```bash
zentao testcases list --product 3
zentao testcases get --id 1
zentao testtasks list
zentao testtasks get --id 1
zentao testsuites list --product 3
zentao testsuites get --id 1
```

## Organization & docs

```bash
zentao users list
zentao departments list
zentao docs libs
zentao docs list --lib 50
zentao docs get --id 1
```

## Project management

```bash
zentao products list
zentao programs list
zentao projects list
zentao projects builds --id 22
zentao executions list
zentao issues list
zentao risks list
```

## JSON output

All commands support `--json` for full JSON payload:

```bash
zentao bugs list --product 6 --json
zentao task get --id 388 --json
zentao users list --json
```

# zentao-mcp

在命令行里查 Bug、看产品，让你的 AI 助手也能直接操作禅道。

零依赖、单文件，装完即用。

## 快速开始

```bash
pnpm i -g @leeguoo/zentao-mcp
```

没有 pnpm？也可以用 npm：

```bash
npm i -g @leeguoo/zentao-mcp
```

不想装？直接跑：

```bash
npx -y @leeguoo/zentao-mcp --help
```

## 登录

只需登录一次，凭据会保存到本地配置文件：

```bash
zentao login \
  --zentao-url=https://zentao.example.com/zentao \
  --zentao-account=你的账号 \
  --zentao-password=你的密码
```

> **注意：** URL 通常需要包含 `/zentao` 路径。如果登录时看到 404，多半是少了这段。

验证登录状态：

```bash
zentao whoami
```

配置文件位置：`~/.config/zentao/config.toml`

## 日常使用

### 查看产品列表

```bash
zentao products list
```

### 查看某个产品的 Bug

```bash
zentao bugs list --product 6
```

### 查看 Bug 详情

```bash
zentao bug get --id 1329
```

### 查看分配给我的 Bug

```bash
zentao bugs mine --status active
```

带详情：

```bash
zentao bugs mine --status active --include-details
```

### 需要原始 JSON？

任何命令后面加 `--json`：

```bash
zentao products list --json
zentao bugs list --product 6 --json
zentao bug get --id 1329 --json
zentao bugs mine --include-details --json
```

### 自检

验证 API 连接是否正常：

```bash
zentao self-test
```

## 让 AI 帮你查禅道（一键安装 Skill）

你可以让 Cursor / Claude Code / Windsurf 等 AI 助手直接帮你操作禅道。只需复制下面的提示词发给你的 AI：

<details>
<summary><strong>点击展开 → 复制提示词发给 AI</strong></summary>

```
请帮我安装 zentao CLI skill，让你以后可以直接帮我查禅道的产品和 Bug。

步骤：

1. 运行 `pnpm i -g @leeguoo/zentao-mcp` 安装 CLI（如果没有 pnpm 就用 npm i -g @leeguoo/zentao-mcp）
2. 找到安装后的 skills 目录，运行：
   node -e "const p=require('path');const r=require('module').createRequire(import.meta?.url||__filename);try{console.log(p.join(p.dirname(r.resolve('@leeguoo/zentao-mcp/package.json')),'skills','zentao','SKILL.md'))}catch{}" 
   如果上面不行，直接用 find 或 ls 在全局 node_modules 里找 @leeguoo/zentao-mcp/skills/zentao/SKILL.md
3. 读取那个 SKILL.md 文件的完整内容
4. 把 SKILL.md 复制到我的 skill 目录：
   - Cursor：~/.cursor/skills/zentao/SKILL.md
   - Claude Code：~/.claude/skills/zentao/SKILL.md（或项目下 .claude/skills/zentao/SKILL.md）
   - 其他工具：按工具的 skill 规范放置
5. 然后帮我运行 `zentao login` 完成登录（会交互式问我 URL、账号、密码）
6. 运行 `zentao self-test` 验证一切正常

完成后告诉我结果。
```

</details>

安装完成后，你就可以直接对 AI 说：

- "帮我看下产品 6 有哪些未解决的 Bug"
- "查一下 Bug #1329 的详情"
- "我名下还有多少活跃 Bug？"

AI 会自动调用 `zentao` 命令帮你完成。

## 常见问题

**Q: 登录时报 404？**
A: URL 需要包含 `/zentao`，比如 `https://zentao.example.com/zentao`，而不是 `https://zentao.example.com/`。

**Q: 支持哪些禅道版本？**
A: 支持禅道开源版和企业版的 REST API（v1）。

**Q: 凭据安全吗？**
A: 凭据以明文 TOML 存储在 `~/.config/zentao/config.toml`，请确保文件权限安全。不要把配置文件提交到 Git。

## 链接

- [npm](https://www.npmjs.com/package/@leeguoo/zentao-mcp)
- [GitHub](https://github.com/leeguooooo/zentao-mcp)
- [问题反馈](https://github.com/leeguooooo/zentao-mcp/issues)

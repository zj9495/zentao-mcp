# zentao-mcp

在命令行里查 Bug、看产品，让你的 AI 助手也能直接操作禅道。

零依赖、单文件，装完即用。

## 快速开始

```bash
npx skills add leeguooooo/zentao-mcp -y -g
```

安装 CLI：

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

`skills add` 只负责安装 skill 文件；CLI 仍然建议全局安装后直接用 `zentao` 命令。

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

## 让 AI 帮你查禅道

只需对你的 AI 助手（Cursor / Claude Code / Windsurf 等）说：

> 帮我执行 `npx skills add leeguooooo/zentao-mcp -y -g`，然后帮我登录禅道

安装后你就可以直接说：

- "帮我看下产品 6 有哪些未解决的 Bug"
- "查一下 Bug #1329 的详情"
- "我名下还有多少活跃 Bug？"

---

<!-- AI_SKILL_INSTALL: 以下内容供 AI 助手自动安装时读取 -->

<details>
<summary><strong>AI Skill 自动安装指引（AI 可直接执行）</strong></summary>

当用户要求安装本仓库为 skill 时，请按顺序执行：

**1. 安装 Skill**

```bash
npx skills add leeguooooo/zentao-mcp -y -g
```

**2. 安装 CLI**

```bash
pnpm i -g @leeguoo/zentao-mcp || npm i -g @leeguoo/zentao-mcp
```

**3. 验证安装**

```bash
zentao --help
```

**4. 引导登录**

提示用户提供禅道 URL、账号和密码，然后执行：

```bash
zentao login --zentao-url="<用户的禅道URL>" --zentao-account="<账号>" --zentao-password="<密码>"
```

> 注意：URL 通常需要包含 `/zentao`，如 `https://zentao.example.com/zentao`

**5. 验证**

```bash
zentao whoami
zentao self-test
```

全部通过后告知用户安装完成。

</details>

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

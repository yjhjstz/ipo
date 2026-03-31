# 多 Agent 协作调研 & CLI 通信架构对比

> 调研日期：2026-03-27
> 来源：
> - https://github.com/raysonmeng/agent-bridge
> - https://github.com/iOfficeAI/AionUi
> - https://github.com/google-gemini/gemini-cli
> - https://github.com/openai/codex

## 1. AgentBridge 项目概述

AgentBridge 是一个本地双向桥接工具，让 Claude Code 和 OpenAI Codex 在同一个开发会话中实时协作。Claude 负责规划/审查，Codex 负责实现/执行。

- **Stars**: 62 | **License**: MIT | **依赖**: 仅 `@modelcontextprotocol/sdk`
- **运行时**: Bun + TypeScript

### 架构

```
Claude Code ↔ bridge.ts (MCP stdio) ↔ WS(:4502) ↔ daemon.ts ↔ WS proxy(:4501) ↔ Codex TUI ↔ Codex app-server(:4500)
```

两进程设计：
- **bridge.ts**（前台）：MCP server，作为 Claude Code channel 插件运行
- **daemon.ts**（后台）：持久化守护进程，管理 Codex app-server 子进程和所有桥接状态

### 关键设计模式

| 模式 | 说明 |
|------|------|
| Adapter 模式 | `ClaudeAdapter` / `CodexAdapter` 各自翻译原生协议到统一 `BridgeMessage` |
| 消息优先级标记 | `[IMPORTANT]` 立即转发，`[STATUS]` 缓冲批量发，`[FYI]` 丢弃 |
| Attention Window | 重要消息/回合完成后暂停 15s 状态消息，给接收方思考时间 |
| Busy Guard | Codex 执行中阻止消息注入，避免打断 |
| Reply-Required 协议 | Claude 可要求 Codex 必须回复，超时会告警 |
| Source 标记 | 每条 `BridgeMessage` 带 `source: "claude" | "codex"`，防止消息回环 |
| 负数 Request ID | bridge 注入用负数 ID，TUI 用正数（从 100000 起），永不冲突 |

## 2. Claude → Codex 消息链路

```
Claude Code
  │  调用 MCP tool "reply" { text, chat_id?, require_reply? }
  ▼
ClaudeAdapter.handleReply()
  │  构造 BridgeMessage { id, source:"claude", content, timestamp }
  ▼
DaemonClient.sendReply()
  │  序列化为 { type: "claude_to_codex", requestId, message }
  │  通过 WebSocket(:4502) 发往 daemon（15s 超时等确认）
  ▼
daemon.ts handleControlMessage()
  │  校验 source === "claude"
  │  检查 tuiConnectionState.canReply()
  │  追加 BRIDGE_CONTRACT_REMINDER（标记规则 + git 禁令 + 角色指引）
  ▼
CodexAdapter.injectMessage()
  │  检查 !turnInProgress（Busy Guard）
  │  发送 JSON-RPC 到 Codex app-server:
  │  { method: "turn/start", id: <负数>, params: { threadId, input: [{ type: "text", text }] } }
  ▼
Codex app-server 开始执行（把注入当作 user turn）
```

核心洞察：**把 Claude 的消息伪装成 Codex 用户输入**——通过 `turn/start` JSON-RPC 创建新 user turn。不需要修改 Codex 任何代码。

## 3. Codex App-Server 启动

Codex CLI 确实有 `app-server` 子命令（标记为 `[experimental]`），定义在 Rust 源码 `codex-rs/cli/src/main.rs`：

```bash
# daemon 启动 app-server
codex app-server --listen ws://127.0.0.1:4500

# CLI 启动 TUI 连代理
codex --enable tui_app_server --remote ws://127.0.0.1:4501
```

- `tui_app_server` feature flag：`Stage::Stable`，`default_enabled: true`
- `--remote` 参数连接远程 app-server WebSocket

Codex app-server 本质是 **Codex 的无头后端**——VS Code 扩展也通过它工作。暴露 JSON-RPC 2.0 WebSocket 接口。

### 三端口架构

| 端口 | 用途 | 所有者 |
|------|------|--------|
| :4500 | Codex app-server（daemon 的子进程） | daemon spawn |
| :4501 | WebSocket 代理（TUI 连这里） | daemon 运行 |
| :4502 | 控制 WebSocket（Claude plugin 连这里） | daemon 运行 |

代理存在的原因：拦截消息转发给 Claude、注入 Claude 的回复、重写 request ID 防冲突。

## 4. 三家 CLI 通信架构对比

### 总览

| 能力 | Codex | Gemini CLI | Claude Code |
|------|-------|-----------|-------------|
| WebSocket Server | ✅ `app-server --listen ws://` | ✗ | ✗ |
| HTTP Server | ✗ | ✅ A2A server（独立包） | ✗ |
| stdio JSON-RPC | ✗ | ✅ ACP (`--acp`) | ✗ |
| stdio JSONL 流 | ✗ | ✅ (`-p --output-format stream-json`) | ✅ (`-p --output-format stream-json`) |
| 双向 stdio 长驻会话 | ✗ | ✅ ACP | ✅ FIFO + stream-json（验证可行） |
| SDK | ✗ | ✅ `@google/gemini-cli-sdk` | ✅ Agent SDK（基于 stream-json） |
| MCP Channel/Plugin | ✗ | ✅ Extensions | ✅ Channels |
| 多 client 同时连 | ✅ 任意 WS client | ✅ HTTP client | ⚠️ FIFO 多写端可行，但 stdout 混合 |

### Codex 方式

```
codex app-server --listen ws://0.0.0.0:4500   ← 无头后端，监听端口
codex TUI --remote ws://host:4500              ← 前端连后端
VS Code extension → 同一个后端
AgentBridge 代理 → 注入 turn/start             ← 第三方可接入
```

### Gemini CLI 方式

```
gemini --acp                                    ← JSON-RPC over stdio（IDE 用）
gemini-cli-a2a-server                           ← HTTP REST + SSE（服务间用）
gemini -p --output-format stream-json           ← JSONL 流（脚本/CI 用）
```

A2A server 是独立 npm 包 `@google/gemini-cli-a2a-server`，Express.js HTTP：
- `/.well-known/agent-card.json` — 服务发现
- `POST /tasks` — 创建任务（SSE 流式返回）
- `POST /executeCommand` — 执行命令

ACP 是开放协议（agentclientprotocol.com），JetBrains、Zed、VS Code 通过它集成。

### Claude Code 方式

```
claude CLI = 完整单体进程（TUI + 推理 + 工具执行）
VS Code 扩展启动 HTTP MCP server → CLI 作为 client 连它（~/.claude/ide/ 存 token）
Remote Control → 出站 HTTPS 长轮询到 Anthropic 服务器（不开本地端口）
```

没有任何对外监听端口。第三方接入方式：
1. Agent SDK — spawn `claude -p --output-format stream-json --input-format stream-json`
2. MCP Channel — Claude spawn 你的 MCP server（stdio）
3. FIFO 长驻会话（见下节）

## 5. FIFO 长驻会话方案（验证可行）

**发现：`claude -p --input-format stream-json` 在 stream-json 模式下会持续等 stdin，支持多轮对话。**

```bash
# 创建 FIFO
mkfifo /tmp/claude-fifo

# 先启动 claude 读端（后台，阻塞等写端）
claude -p --output-format stream-json --input-format stream-json < /tmp/claude-fifo &

# 再打开写端（两端都有了，阻塞解除）
exec 3>/tmp/claude-fifo

# 发消息
echo '{"type":"user","message":{"role":"user","content":"What is 2+2?"}}' >&3

# 等响应后继续对话（有上下文记忆）
echo '{"type":"user","message":{"role":"user","content":"Now multiply that by 10"}}' >&3

# 结束
exec 3>&-    # 关闭 fd，触发 EOF
rm /tmp/claude-fifo
```

注意事项：
- **启动顺序**：必须先 `< fifo`（读端后台），再 `exec 3>fifo`（写端），否则 `exec` 会阻塞
- **FIFO 语义**：写端全关闭时读端收到 EOF，进程退出
- **stdout 混合**：多进程可以往同一 FIFO 写，但 claude 的响应都在同一个 stdout，没有请求-响应对应

### 与其他方案对比

| 方案 | 谁 spawn 谁 | 长驻？ | 需要 plugin？ | 复杂度 |
|------|------------|--------|-------------|--------|
| FIFO + stream-json | 外部 spawn Claude | ✅ | 否 | 低 |
| MCP Channel | Claude spawn 外部 | 跟随会话 | 是 | 中 |
| Codex app-server | 外部 spawn Codex | ✅ 监听端口 | 否 | 低 |
| Agent SDK | 外部 spawn Claude | 按调用 | 否 | 低 |

FIFO 方案优势：不需要 MCP channel、不需要 plugin 加载、不需要 `--dangerously-load-development-channels`。
劣势：没有 MCP 的 tool 注册能力（不能给 Claude 暴露自定义 tool），只能单向注入 user message。

## 6. AionUi 项目分析

> 来源：https://github.com/iOfficeAI/AionUi

AionUi 是一个 Electron 桌面应用，统一管理 20+ 种 AI CLI agent。**不是多 Agent 协作，而是多 Agent 统一管理**——agent 之间不互相通信，用户是唯一的编排者。

### 架构

```
┌──────────────── AionUi (Electron) ────────────────┐
│  Renderer (React + Arco Design)                    │
│    ├─ 会话 1: Claude Code                          │
│    ├─ 会话 2: Codex            每个会话绑定一个     │
│    ├─ 会话 3: Gemini CLI       agent，用户手动切换  │
│    └─ 会话 4: Goose                                │
│         ↕ IPC (contextBridge)                      │
│  Main Process                                      │
│    ├─ WorkerTaskManager（管理所有活跃 agent 实例）   │
│    ├─ AgentFactory（Registry 模式，按类型创建）      │
│    ├─ ChannelEventBus（全局事件总线）                │
│    └─ Worker Processes（每个 agent 一个 fork）      │
│         ├─ ACP Worker → spawn claude/codex/gemini  │
│         ├─ Gemini Worker → 内置引擎，直接 API      │
│         └─ OpenClaw Worker → WebSocket             │
└────────────────────────────────────────────────────┘
```

### ACP 作为统一适配层

AionUi 最大的贡献：用 **ACP (Agent Control Protocol)** 一套代码接入 15+ CLI agent。

支持的 ACP 后端：
- `claude` — via `npx @zed-industries/claude-agent-acp`（stream-json → ACP 翻译）
- `codex` — via `npx @zed-industries/codex-acp`
- `gemini` — `gemini --experimental-acp`（原生）
- `goose` — `goose acp`（原生）
- `qwen` — `npx @qwen-code/qwen-code --acp`
- `auggie`, `kimi`, `codebuddy`, `iflow`, `droid`, `opencode`, `copilot`, `qoder`, `vibe`, `cursor`, `custom`

通信统一为 JSON-RPC 2.0 over stdio：
```
AionUi Main ──stdin──→ CLI Agent 子进程（无头，无 UI）
AionUi Main ←──stdout── CLI Agent 子进程
```

### ACP 模式下 Agent 是无头的

**关键认知：ACP 模式下 agent 没有自己的 UI。**

```
传统模式：
  用户 ←→ codex TUI（Codex 自带的终端 UI）
  用户 ←→ claude TUI（Claude 自带的终端 UI）

ACP 模式：
  AionUi GUI ←─ JSON-RPC stdio ─→ codex --acp（无头，无 UI）
  AionUi GUI ←─ JSON-RPC stdio ─→ claude via ACP bridge（无头，无 UI）
```

Agent 被 spawn 为子进程，stdio 被接管，没有终端可以画 UI。所有输出都是 JSON-RPC 消息，由 ACP 客户端来渲染。类比 LSP：language server 没有 UI，IDE 渲染一切。

### ACP 完整会话流程

```
Client                              Agent (e.g. codex --acp)
  │── initialize ──────────────────→│  握手，交换能力
  │←── result (authMethods, caps) ──│
  │── authenticate (API key) ──────→│  认证
  │←── result {} ──────────────────│
  │── session/new (cwd, mcpServers)→│  创建会话（可带 MCP servers）
  │←── result (sessionId, modes) ──│
  │── session/prompt ─────────────→│  发提示
  │←── session/update (思考) ──────│  流式通知（多条）
  │←── session/update (文本) ──────│
  │←── session/update (工具调用) ──│
  │←── session/request_permission ─│  请求权限（双向 RPC）
  │── result (approve/reject) ────→│
  │←── result (stopReason) ────────│  本轮结束
  │── session/prompt (第二轮) ────→│  多轮对话
```

### session/update 消息类型

| sessionUpdate | 说明 |
|---------------|------|
| `agent_message_chunk` | 流式文本回复 |
| `agent_thought_chunk` | 思考/推理过程 |
| `tool_call` | 工具调用（开始） |
| `tool_call_update` | 工具调用（进度/完成） |
| `plan` | 步骤计划 |
| `config_option_update` | 模型切换通知 |
| `usage_update` | token 用量 |
| `available_commands_update` | 可用斜杠命令列表 |

### 与 AgentBridge 的本质区别

```
AgentBridge: Claude ←── 双向消息 ──→ Codex    （agent 间协作）
AionUi:     Claude ←→ 用户 ←→ Codex            （用户当中转）
```

AgentBridge 做 **agent-to-agent**，AionUi 做 **user-to-many-agents**。

### ACP 协议细节

**协议**: JSON-RPC 2.0 over ndjson stdio，版本号 `PROTOCOL_VERSION = 1`

**认证方式**（在 `initialize` 响应的 `authMethods` 中列出）：
- `gemini_api_key` — API key（`_meta["api-key"]`）
- `login_with_google` — Google OAuth
- `vertex_ai` — Vertex AI
- `gateway` — 自定义网关（`_meta.gateway.baseUrl` + `_meta.gateway.headers`）

**客户端能力**（`initialize` 时声明）：
- `fs.readTextFile` / `fs.writeTextFile` — 文件系统代理（agent 通过 client 读写文件）
- `terminal` — 终端执行代理

**会话管理 RPC**：
- `session/new` — 创建（可带 `mcpServers` 暴露 tool 给 agent）
- `session/load` — 恢复历史会话
- `session/list` — 列出会话
- `session/cancel` — 取消当前执行（notification，无需响应）
- `session/set_mode` — 切换模式（`default`/`autoEdit`/`yolo`/`plan`）
- `session/set_model` — 切换模型

**权限审批**（双向 RPC）：
```json
{"method":"session/request_permission","id":"a-1","params":{
  "options":[
    {"optionId":"proceed_once","name":"Allow","kind":"allow_once"},
    {"optionId":"proceed_always","name":"Allow for session","kind":"allow_always"},
    {"optionId":"cancel","name":"Reject","kind":"reject_once"}
  ],
  "toolCall":{"toolCallId":"write-1","title":"Edit main.ts","kind":"edit",
    "content":[{"type":"diff","path":"main.ts","newText":"..."}]}
}}
```

**MCP tool 暴露**：`session/new` 的 `mcpServers` 参数支持 stdio/HTTP/SSE 三种 MCP server，agent 自动发现并使用这些 tool。

**与 Claude stream-json 协议对比**：

| | Claude `-p stream-json` | ACP (Gemini/Codex/etc.) |
|---|---|---|
| 协议 | 非标准 JSONL | JSON-RPC 2.0 |
| 认证 | 环境变量预配置 | `authenticate` RPC 4 种方式 |
| 会话管理 | 隐式 | 显式 `session/new`/`load`/`list` |
| 暴露 tool 给 agent | ✗ | ✅ `mcpServers` 参数 |
| 权限审批 | ✗ | ✅ `request_permission` 双向 RPC |
| 文件系统代理 | ✗ | ✅ `fs/read_text_file` 经 client |
| 取消 | ✗ | ✅ `session/cancel` |
| 切换模型/模式 | ✗ | ✅ `set_model` / `set_mode` |

**ACP 是目前最完整的 agent-IDE 协议**（agentclientprotocol.com），JetBrains、Zed、VS Code 通过它集成。

## 7. QuantWise 双向可能性

### 作为 ACP Client（控制其他 agent）

```
QuantWise TUI
  ├─ 内置模型（当前的 Claude API 调用）      ← 主 agent
  ├─ spawn codex --acp                       ← Codex 当 subagent（无头）
  ├─ spawn gemini --acp                      ← Gemini 当 subagent（无头）
  └─ spawn goose acp                         ← 任何支持 ACP 的 CLI
```

所有 agent 的输出统一在 QuantWise TUI 渲染，用户不需要开多个终端。
比 AgentBridge 方案简单得多——不需要 daemon + 代理 + 三端口，只需子进程 + stdio。

### 作为 ACP Server（被其他工具控制）

```bash
quantwise --acp    # 暴露 ACP JSON-RPC over stdio
```

AionUi、Zed、JetBrains 就能把 QuantWise 当作 agent 使用，与 Claude/Codex/Gemini 并列。
需要实现：`initialize`、`authenticate`、`session/new`、`session/prompt`、`session/update` 等 RPC。

### Claude 的 ACP 桥接

Claude Code 不原生支持 ACP，Zed 写了桥接包 `@zed-industries/claude-agent-acp`：
- 底层 spawn `claude -p --output-format stream-json --input-format stream-json`
- 将 stream-json 协议翻译成 ACP JSON-RPC
- QuantWise 可以复用同样的思路实现 `quantwise --acp`

## 8. QuantWise 可吸收的设计总结

### 高价值

- **ACP 适配层**：一套 ACP 代码接入 15+ CLI agent（AionUi 已验证），QuantWise 作为 ACP client 可直接控制 Codex/Gemini/Goose 等
- **ACP Server 模式**：实现 `quantwise --acp` 让 AionUi/Zed/JetBrains 接入 QuantWise
- **消息优先级过滤**：`[IMPORTANT]`/`[STATUS]`/`[FYI]` 标记系统（AgentBridge），适用于 subagent 输出管理
- **结构化协作指令注入**：每次消息传递时注入 Bridge Contract（AgentBridge）
- **FIFO 长驻会话**：作为轻量级 server 模式的替代方案（已验证可行）

### 中等价值

- **Attention Window**：多 agent 并发时防信息洪水（AgentBridge）
- **Busy Guard**：防止在 agent 执行中注入消息（AgentBridge）
- **Worker 隔离模式**：每个 agent 跑在独立 fork 进程里（AionUi），比主进程内 subagent 更健壮
- **ChannelEventBus**：全局事件总线解耦 agent 消息和 UI 渲染（AionUi）
- **跨 Provider 角色分工**：不同 provider 模型执行不同角色

### 不建议吸收

- 双进程架构 bridge + daemon（AgentBridge）：对 QuantWise 过于复杂
- WebSocket 代理层（AgentBridge）：除非要接入 Codex 的 app-server
- Electron 桌面架构（AionUi）：QuantWise 是 CLI 工具
- OpenClaw WebSocket 协议（AionUi）：私有协议，生态小
- 多会话并行管理（AionUi）：QuantWise 是单会话模型

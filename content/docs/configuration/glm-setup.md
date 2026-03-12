# GLM (智谱 BigModel) 配置指南

QuantWise 支持通过智谱 AI 的 Anthropic 兼容代理使用 GLM 系列模型。

## 前提条件

1. 在 [智谱开放平台](https://open.bigmodel.cn) 注册账号
2. 创建 API Key（账户 → API Keys）

## 快速配置

### 方式一：配置 .env

编辑项目根目录下的 `.env` 文件：

```bash
ANTHROPIC_AUTH_TOKEN=your_zhipu_api_key
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
ANTHROPIC_MODEL=glm-4.7
API_TIMEOUT_MS=3000000
USER_TYPE=SWE_BENCH

# 模型层级映射
ANTHROPIC_DEFAULT_OPUS_MODEL=glm-5
ANTHROPIC_DEFAULT_SONNET_MODEL=glm-4.7
ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-4.5-air
```

### 方式二：通过 settings.json 配置

编辑 `~/.claude/settings.json`：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  }
}
```

> **注意**：`settings.json` 的 `env` 优先级高于 `.env` 文件，同名变量会被覆盖。建议只用一种方式配置。

## 模型层级映射

QuantWise 内部使用三个模型层级。通过环境变量可将每个层级映射到对应的 GLM 模型：

| 环境变量 | 层级 | 推荐 GLM 模型 | 用途 |
|----------|------|--------------|------|
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | opus | `glm-5` 或 `glm-4.7` | Agent 高级任务 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | sonnet | `glm-4.7` | 主对话模型（默认） |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | haiku | `glm-4.5-air` | 快速轻量任务（摘要、WebFetch） |

`ANTHROPIC_MODEL` 设置的是主对话模型，优先级高于 `ANTHROPIC_DEFAULT_SONNET_MODEL`。

## GLM 模型列表

| 模型 | 说明 |
|------|------|
| `glm-5` | 最强模型，高峰期（14:00-18:00 UTC+8）消耗 3 倍额度 |
| `glm-4.7` | 性价比最优，推荐日常使用 |
| `glm-4.5-air` | 快速推理，适合轻量任务 |

## 验证配置

启动 QuantWise 后输入 `/status` 查看当前配置：

```
QuantWise Status v1.3.5

  Session ID: abc12345-...

Account
  Auth Token: 3a707f64…8vRb

API Configuration
  Anthropic Base URL: https://open.bigmodel.cn/api/anthropic
  Timeout: 3000000ms

Model • /model
  glm-4.7  (ANTHROPIC_MODEL)

Model Tiers
  opus:   glm-5
  sonnet: glm-4.7
  haiku:  glm-4.5-air
```

## 多 Provider 切换架构

```
.env.anyrouter   # AnyRouter 代理配置（token、url、model）
.env.synx        # Claude 官方 API 配置（API key）
.env.glm         # GLM 智谱配置（token、url、model tiers）
.env.shared      # 共享配置（FMP、Tavily、Telegram 等）
.env             # 运行时文件 = 选中的 profile + shared（由 switch-env.sh 生成）
```

## 常见问题

### Q: /model 选择的模型和 ANTHROPIC_MODEL 环境变量哪个优先？

模型优先级从高到低：
1. `/model` 命令选择（项目级，存储在 `~/.claude.json` 的 projects 配置中）
2. `ANTHROPIC_MODEL` 环境变量
3. `ANTHROPIC_DEFAULT_SONNET_MODEL` 环境变量
4. 硬编码默认值

### Q: GLM-5 用量计费怎么算？

GLM-5 高峰期（14:00-18:00 UTC+8）消耗 3 倍额度，非高峰 2 倍。建议仅在复杂任务时使用，日常用 `glm-4.7`。

### Q: max_tokens 或 context window 不对怎么办？

QuantWise 内置了 GLM 模型的 token 限制表。如果使用新模型或需要自定义，用环境变量覆盖：

```bash
ANTHROPIC_MAX_OUTPUT_TOKENS=65536    # 覆盖 max output tokens
ANTHROPIC_CONTEXT_WINDOW=131072      # 覆盖 context window
```

内置 GLM 模型限制：

| 模型 | max_tokens | context_window |
|------|-----------|----------------|
| glm-5 / glm-4.7 / glm-4.6 | 65,536 | 131,072 |
| glm-4.6v 系列 | 16,384 | 32,768 |
| glm-4.5 / glm-4.5-air | 65,536 | 98,304 |
| glm-4.5v / glm-4-32b | 16,384 | 16,384 |

### Q: API 超时怎么办？

GLM 响应速度可能慢于 Claude 直连，建议设置 `API_TIMEOUT_MS=3000000`（50 分钟）。

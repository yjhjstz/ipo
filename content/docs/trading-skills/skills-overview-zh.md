# 交易技能总览 (31 个金融/交易 Skills)

QuantWise 内置 31 个专业金融交易技能，覆盖从市场择时到组合管理的完整投资工作流。所有技能均可通过 `/skill-name` 斜杠命令直接调用。

## 市场择时与环境判断

| 技能 | 说明 |
|------|------|
| `/market-top-detector` | 市场顶部概率评分 (0-100)，基于分发日、领涨股恶化、防御性轮动等 6 维度 |
| `/macro-regime-detector` | 宏观体制识别（集中/扩散/收缩/通胀/过渡 5 种状态），跨资产比率分析 |
| `/us-market-bubble-detector` | 修订版 Minsky/Kindleberger 框架泡沫风险定量评估，优先使用 Put/Call、VIX、保证金债务等客观指标 |
| `/ftd-detector` | Follow-Through Day 底部确认信号，双指数跟踪（S&P 500 + NASDAQ），采用 William O'Neil 方法论 |
| `/breadth-chart-analyst` | S&P 500 广度指数（200日均线）图表分析 |
| `/uptrend-analyzer` | 上升趋势比率仪表盘，从广度、板块参与度、轮动、动量、历史背景 5 个维度生成 0-100 评分 |
| `/market-breadth-analyzer` | 市场广度健康评分（6 维度，100 = 健康），使用 TraderMonty 公开 CSV 数据，无需 API 密钥 |
| `/market-environment-analysis` | 综合市场环境分析，覆盖美国、欧洲、亚洲市场、外汇、大宗商品和经济指标 |

## 选股筛选

| 技能 | 说明 |
|------|------|
| `/canslim-screener` | William O'Neil CANSLIM 7 维度成长股筛选：当季盈利、年度盈利、新产品/管理层、供需、领导力、机构支持、市场方向 |
| `/vcp-screener` | Mark Minervini 波动率收缩模式（VCP），识别 Stage 2 上升趋势中的突破候选股 |
| `/dividend-growth-pullback-screener` | 高股息增长（12%+ 年增长率，1.5%+ 收益率）+ RSI 超卖（≤40）回调机会 |
| `/value-dividend-screener` | 低估值（P/E < 20, P/B < 2）高分红（3%+）+ 持续增长筛选 |
| `/pair-trade-screener` | 统计套利配对交易，检测板块内协整股票对，分析价差行为和 Z-score |

## 个股分析

| 技能 | 说明 |
|------|------|
| `/us-stock-analysis` | 基本面（财务指标、商业质量、估值）+ 技术面（指标、图表模式、支撑阻力）综合分析 |
| `/stock` | 股票分析工作站：实时行情查询、终端 K 线图、存入 Notion、深度分析 |
| `/chart` | 终端 candlestick K 线图渲染 |
| `/technical-analyst` | 周线图表模式识别、趋势判断、支撑阻力位、概率评估 |
| `/sector-analyst` | 板块轮动分析与行业领导力评估，支持 1 周/1 月时间框架 |
| `/institutional-flow-tracker` | 13F 机构持仓变动追踪，识别聪明钱大幅建仓/减仓信号 |
| `/options-strategy-advisor` | 期权策略建模：Black-Scholes 定价、Greeks 计算、策略 P/L 模拟 |

## 策略与组合管理

| 技能 | 说明 |
|------|------|
| `/weekly-trade-strategy` | 4 步编排生成周交易策略博客：技术分析 → 市场评估 → 新闻分析 → 报告生成。可选第 5 步 Druckenmiller 风格中长期战略 |
| `/stanley-druckenmiller-investment` | 基于 Druckenmiller 30 年无亏损投资哲学的宏观分析、风险管理、仓位构建顾问 |
| `/portfolio-manager` | 通过 Alpaca MCP 获取真实持仓，分析资产配置、风险指标、多样化程度，生成再平衡建议 |
| `/backtest-expert` | 系统化回测方法论指导：参数敏感性测试、滑点建模、偏差预防、过拟合检测 |
| `/deep-research` | 串行运行 4 个分析 agent（基本面 / 技术面 / 催化剂 / 风险）→ 综合研报 → 自动存入 Notion |

## 市场情报

| 技能 | 说明 |
|------|------|
| `/market-news-analyst` | 近 10 天市场重大新闻影响分析与排名 |
| `/earnings-calendar` | 周度美股财报日历（$2B+ 市值公司） |
| `/economic-calendar-fetcher` | 经济数据发布日历：央行利率决议、就业报告、CPI、GDP 等 |
| `/theme-detector` | 热门/冷门市场主题识别，分析主题生命周期（萌芽 → 加速 → 成熟 → 衰退） |
| `/scenario-analyzer` | 以新闻标题为输入，推演 18 个月多情景影响（一级/二级/三级），输出推荐股票与策略评审 |

## 辅助工具

| 技能 | 说明 |
|------|------|
| `/vote-sim` | 群体决策模拟器，用正态分布温度控制 N 个独立 LLM agent 投票，模拟人类群体意见分布 |

## 快速开始

```bash
# 市场择时：当前是否该减仓？
/market-top-detector

# 选股：CANSLIM 成长股筛选
/canslim-screener

# 个股深度研究
/deep-research AAPL

# 周交易策略
/weekly-trade-strategy

# 实时行情
/stock NVDA

# 终端 K 线图
/chart TSLA
```

## 环境变量

部分技能需要 API 密钥：

| 变量 | 用途 |
|------|------|
| `FMP_API_KEY` | Financial Modeling Prep（选股筛选、财报日历、经济日历等） |
| `TAVILY_API_KEY` | Web 搜索（新闻分析、情景推演等） |

## MCP 集成

以下技能通过 MCP Server 获取数据：

- **stock-analysis MCP** — 实时行情、历史数据（`/stock`、筛选类技能）
- **Notion MCP** — 研报存储（`/deep-research`、`/stock save`）
- **Alpaca MCP** — 真实持仓数据（`/portfolio-manager`）

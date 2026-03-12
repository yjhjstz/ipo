# Plan Mode

Plan mode lets you design complex workflows before execution, ensuring QuantWise follows your intended strategy step by step.

## How It Works

1. **Enter plan mode** — describe what you want to accomplish
2. **QuantWise creates a plan** — step-by-step execution blueprint
3. **Review and approve** — modify or approve the plan
4. **Execute** — QuantWise follows the approved plan

## When to Use Plan Mode

- **Multi-step analysis workflows** requiring sequential data gathering
- **Complex trading strategies** that depend on multiple conditions
- **Portfolio rebalancing** with many positions to analyze
- **Research tasks** combining technical, fundamental, and sentiment analysis

## Example

```
User: "Create a weekly strategy report for my portfolio"

Plan Mode activates:
  Step 1: Fetch portfolio positions from Alpaca
  Step 2: Run technical analysis on top 10 holdings
  Step 3: Check market breadth indicators
  Step 4: Analyze sector rotation signals
  Step 5: Review upcoming economic calendar
  Step 6: Compile into weekly strategy blog

User: "Approved, execute"
```

## Plan Mode vs Direct Execution

| Feature | Direct Mode | Plan Mode |
|---------|-------------|-----------|
| Speed | Faster | Requires review step |
| Control | AI decides flow | You approve each step |
| Complexity | Simple tasks | Multi-step workflows |
| Transparency | Results only | Full execution plan visible |

## Modifying Plans

Before approving, you can:

- **Add steps**: "Also include options flow analysis"
- **Remove steps**: "Skip the sector rotation part"
- **Reorder steps**: "Do the economic calendar first"
- **Change parameters**: "Analyze top 20 holdings instead of 10"

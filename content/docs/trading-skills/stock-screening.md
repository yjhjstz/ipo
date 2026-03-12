# Stock Screening Skills

## /canslim-screener

Screen US stocks using William O'Neil's CANSLIM growth methodology.

- **7 Components** (weighted scoring 0–100):
  - **C** – Current quarterly earnings (15%)
  - **A** – Annual earnings growth (20%)
  - **N** – New products/management/highs (15%)
  - **S** – Supply and demand (15%)
  - **L** – Leader or laggard / RS Rank (20%)
  - **I** – Institutional sponsorship (10%)
  - **M** – Market direction (5%)
- **Ratings**: Exceptional+ (90+), Exceptional (80–89), Strong (70–79), Above Average (60–69)
- **Requires**: `FMP_API_KEY` (250 free calls/day)
- **Execution Time**: ~1 min 40 sec for 40 stocks

## /vcp-screener

Identify stocks in Volatility Contraction Patterns (Minervini methodology).

- **Pattern**: Decreasing price range contractions forming a tightening base
- **Entry**: Breakout above the pivot point with volume confirmation
- **Focus**: Technical pattern recognition and timing

## /pair-trade-screener

Statistical arbitrage tool for finding cointegrated pair trades.

- **Methodology**: Correlation + cointegration + z-score analysis
- **Thresholds**:
  - Correlation ≥ 0.70
  - ADF cointegration test (p < 0.05)
  - Z-score ±2.0 entry, 0 exit
- **Requires**: `FMP_API_KEY`
- **Output**: Pair analysis report with entry/exit signals

## /dividend-growth-pullback-screener

Find quality dividend growth stocks during price pullbacks.

- **Criteria**: High dividend growth + RSI oversold conditions
- **Focus**: Value entry points in quality dividend payers

## /value-dividend-screener

Screen for value stocks with dividend potential.

## /ftd-detector

Detect Follow-Through Day signals for market bottom confirmation.

- **Framework**: William O'Neil's FTD methodology
- **Signal**: Large up day on increased volume after a market correction

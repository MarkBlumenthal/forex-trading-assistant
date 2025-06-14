# Forex Flag Pattern Trader

A specialized forex trading tool that identifies flag pattern breakouts with pullback entries across 10 major currency pairs. The system provides precise entry, stop loss, and take profit levels based on a strict 2:1 reward-to-risk ratio while accounting for broker spreads.

## Features

- **Multi-Currency Support**: Analyze EUR/USD, USD/JPY, GBP/USD, AUD/USD, NZD/USD, EUR/GBP, USD/CHF, EUR/JPY, USD/CAD, GBP/JPY
- **Flag Pattern Recognition**: Identifies bullish and bearish flag patterns with pullback entries
- **3-Touch Trendline Rule**: Confirms patterns with at least 3 touches of the trendline
- **Multi-Timeframe Analysis**:
  - 4-Hour timeframe: Pattern identification and overall trend
  - 1-Hour timeframe: Entry timing and precise levels

- **Pure 2:1 Risk Management**:
  - 2% risk per trade
  - **Dynamic stop loss based on pattern structure** (no artificial pip limits)
  - **Exact 2:1 reward-to-risk ratio** - take profit is always 2× the stop loss distance
  - Spread-adjusted calculations for true risk/reward ratio

- **Spread Integration**:
  - Currency-specific spread calculations
  - Time-of-day spread adjustments (lower during high liquidity, higher during off hours)
  - Accurate entry, stop loss, and take profit calculations that account for spread costs

- **News Sentiment Analysis**: Aggregates and analyzes news from multiple financial sources
- **Economic Calendar Integration**: Tracks high-impact events that affect trading
- **Position Sizing Calculator**: Calculates lot sizes based on 2% risk per trade
- **Automatic Lot Size Scaling**: Increases lot size as account grows (0.1 lots per £1000)

## Supported Currency Pairs

- EUR/USD (Euro/US Dollar)
- USD/JPY (US Dollar/Japanese Yen)
- GBP/USD (British Pound/US Dollar)
- AUD/USD (Australian Dollar/US Dollar)
- NZD/USD (New Zealand Dollar/US Dollar)
- EUR/GBP (Euro/British Pound)
- USD/CHF (US Dollar/Swiss Franc)
- EUR/JPY (Euro/Japanese Yen)
- USD/CAD (US Dollar/Canadian Dollar)
- GBP/JPY (British Pound/Japanese Yen)

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React
- **Charts**: ApexCharts (professional candlestick visualization)
- **APIs**:
  - Twelve Data (forex prices)
  - Multiple RSS feeds (news)
  - Economic calendars

- **Pattern Recognition**: Custom flag pattern detection with 3-touch rule validation

## Installation

### Clone the repository:
```bash
git clone <repository-url>
cd forex-flag-trader
```

### Install backend dependencies:
```bash
cd backend
npm install
```

### Install frontend dependencies:
```bash
cd ../frontend
npm install --legacy-peer-deps
```

### Set up environment variables:

Create a `.env` file in the backend directory
Add your API keys:

```
PORT=5000
TWELVE_DATA_API_KEY=your_twelve_data_api_key_here
TIMEZONE=Asia/Jerusalem
```

**Get API keys**: Sign up for a free Twelve Data account at https://twelvedata.com/

## Usage

### Starting the Application

1. **Start the backend server:**
```bash
cd backend
npm run dev
```

2. **Start the frontend (in a new terminal):**
```bash
cd frontend
npm start
```

3. **Open your browser to** http://localhost:3000

### Using the System

1. **Select Currency Pair**: Click on any of the 10 available pairs
2. **Analyze**: Click "Analyze [Pair] Now" for current market conditions
3. **Account Settings**: Set your account balance (default £1000)
4. **Trading Decision**: System will show:
   - BUY/SELL/WAIT decision
   - Flag pattern details (if detected)
   - Entry, stop loss, and take profit levels (adjusted for spread)
   - Position sizing calculations
   - Risk/Reward ratio (always 2:1, showing actual ratio after spread)

## Flag Pattern Strategy

The system identifies flag patterns using these criteria:

1. **Flag Pole**: Strong directional move in price (bullish or bearish)
2. **Consolidation**: Price consolidates against the trend, forming a flag
3. **Trendline Validation**: Requires at least 3 touches of the trendline
4. **Breakout**: Price breaks out from the flag in the original trend direction
5. **Pullback Entry**: Waits for a pullback to the breakout level for entry
6. **Dynamic Risk Parameters**: Stop loss determined by pattern structure, take profit at exactly 2× the stop loss distance

## Position Sizing

When a flag pattern trade is identified, the system calculates:

- **Risk Amount**: 2% of account balance
- **Lot Size**: Based on risk amount and stop loss distance
- **Standard Lot Size**: Uses 0.1 lots per £1000 in account balance
- **Take Profit**: Exactly 2× the stop loss distance (pure 2:1 ratio)
- **Spread Adjustment**: Entry, stop loss, and take profit prices account for broker spread
- **MT4 Instructions**: Provides exact entry, stop loss, and take profit prices

## Real-Time Analysis & Next Check Recommendations

- **24/5 Operation**: Works anytime forex markets are open
- **On-Demand Analysis**: Analyze any pair with real-time data when you need it
- **Smart Next Check Recommendations**: The system suggests when to check back based on the current pattern status:
  - 1 hour if a breakout has occurred (waiting for pullback)
  - 2 hours if consolidation is detected (waiting for breakout)
  - 1 hour if a valid trade setup is found (for monitoring)
  - 4 hours if no pattern is forming (default)

- **Context-Aware Reasoning**: Explains why you should check back at the suggested time

## Project Structure

```
forex-flag-trader/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── priceDataService.js         # Forex price data fetching
│   │   │   ├── patternRecognition.js       # Flag pattern detection
│   │   │   ├── technicalAnalysisService.js # Pattern analysis
│   │   │   ├── newsAnalysisService.js      # News sentiment analysis
│   │   │   ├── economicCalendarService.js  # Economic events tracking
│   │   │   ├── positionCalculator.js       # Position sizing logic
│   │   │   └── analysisEngine.js           # Main decision engine
│   │   └── index.js                        # Express server
│   ├── .env                                # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js                # Main dashboard
│   │   │   ├── PriceChart.js               # Candlestick chart with pattern visualization
│   │   │   ├── MultiTimeframeAnalysis.js   # Flag pattern display
│   │   │   ├── NewsSection.js              # News feed & sentiment
│   │   │   ├── EconomicCalendar.js         # Economic events
│   │   │   ├── PositionSizing.js           # Trade calculations
│   │   │   └── AccountSettings.js          # Account configuration
│   │   ├── App.js                          # Main app component
│   │   ├── App.css                         # Styles
│   │   └── index.js                        # Entry point
│   └── package.json
└── README.md
```

## News Sources

- Bloomberg Markets
- MarketWatch
- CNBC Forex
- Investing.com
- ForexLive
- FXStreet
- TradingView

## Risk Management

- **2% Risk Rule**: Never risk more than 2% per trade
- **Pattern-Based Stop Loss**: Distance determined by flag pattern structure (no artificial limits)
- **Exact 2:1 Ratio**: Take profit is always exactly 2× the stop loss distance
- **True Risk-Reward**: Shows actual ratio after spread costs
- **Lot Size Scaling**: Increases with account growth
- **Spread Consideration**: All calculations account for broker spread costs

## Important Notes

- This tool provides analysis but doesn't guarantee profits
- Past performance doesn't indicate future results
- Forex trading involves significant risk
- Always use proper risk management
- The system only trades when all pattern requirements are met
- Most signals will be "WAIT" - this is intentional for safety
- Stop loss distance is determined by the pattern structure itself
- Take profit is always set at exactly 2× the stop loss distance
- Currency-specific pip values and spreads are automatically calculated
- Spread calculations adjust based on time of day

## Best Practices

- **Start Small**: Begin with minimum position sizes
- **Paper Trade First**: Test the system without real money
- **Follow the System**: Don't override the trade criteria
- **Risk Management**: Stick to 2% risk per trade
- **Multiple Pairs**: Monitor all currency pairs for opportunities
- **Be Patient**: Flag patterns with pullback entries are high-quality but rare setups
- **Trust the Pattern**: Let the flag pattern structure determine your risk levels
- **Maintain 2:1 Ratio**: System automatically ensures take profit is 2× stop loss distance
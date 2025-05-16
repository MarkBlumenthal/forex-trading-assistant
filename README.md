Forex Flag Pattern Trader
A specialized forex trading tool that identifies flag pattern breakouts with pullback entries across 10 major currency pairs. The system provides precise entry, stop loss, and take profit levels based on a strict 3:1 reward-to-risk ratio.
Features

Multi-Currency Support: Analyze EUR/USD, USD/JPY, GBP/USD, AUD/USD, NZD/USD, EUR/GBP, USD/CHF, EUR/JPY, USD/CAD, GBP/JPY
Flag Pattern Recognition: Identifies bullish and bearish flag patterns with pullback entries
3-Touch Trendline Rule: Confirms patterns with at least 3 touches of the trendline
Multi-Timeframe Analysis:

4-Hour timeframe: Pattern identification and overall trend
1-Hour timeframe: Entry timing and precise levels


Fixed Risk Management:

20-pip stop loss maximum
60-pip take profit target
3:1 reward-to-risk ratio


News Sentiment Analysis: Aggregates and analyzes news from multiple financial sources
Economic Calendar Integration: Tracks high-impact events that affect trading
Position Sizing Calculator: Calculates lot sizes based on 2% risk per trade
Automatic Lot Size Scaling: Increases lot size as account grows (0.1 lots per £1000)

Supported Currency Pairs

EUR/USD (Euro/US Dollar)
USD/JPY (US Dollar/Japanese Yen)
GBP/USD (British Pound/US Dollar)
AUD/USD (Australian Dollar/US Dollar)
NZD/USD (New Zealand Dollar/US Dollar)
EUR/GBP (Euro/British Pound)
USD/CHF (US Dollar/Swiss Franc)
EUR/JPY (Euro/Japanese Yen)
USD/CAD (US Dollar/Canadian Dollar)
GBP/JPY (British Pound/Japanese Yen)

Tech Stack

Backend: Node.js, Express
Frontend: React
Charts: Recharts (candlestick visualization)
APIs:

Twelve Data (forex prices)
Multiple RSS feeds (news)
Economic calendars


Pattern Recognition: Custom flag pattern detection with 3-touch rule validation

Installation
Clone the repository:
bashgit clone <repository-url>
cd forex-flag-trader
Install backend dependencies:
bashcd backend
npm install
Install frontend dependencies:
bashcd ../frontend
npm install --legacy-peer-deps
Set up environment variables:

Create a .env file in the backend directory
Add your API keys:

PORT=5000
TWELVE_DATA_API_KEY=your_twelve_data_api_key_here
TIMEZONE=Asia/Jerusalem

Get API keys: Sign up for a free Twelve Data account at https://twelvedata.com/

Usage
Starting the Application
Start the backend server:
bashcd backend
npm run dev
Start the frontend (in a new terminal):
bashcd frontend
npm start
Open your browser to http://localhost:3000
Using the System

Select Currency Pair: Click on any of the 10 available pairs
Analyze: Click "Analyze [Pair] Now" for current market conditions
Account Settings: Set your account balance (default £1000)
Trading Decision: System will show:

BUY/SELL/WAIT decision
Flag pattern details (if detected)
Entry, stop loss, and take profit levels
Position sizing calculations
Risk/Reward ratio (fixed at 3:1)



Flag Pattern Strategy
The system identifies flag patterns using these criteria:

Flag Pole: Strong directional move in price (bullish or bearish)
Consolidation: Price consolidates against the trend, forming a flag
Trendline Validation: Requires at least 3 touches of the trendline
Breakout: Price breaks out from the flag in the original trend direction
Pullback Entry: Waits for a pullback to the breakout level for entry
Fixed Risk Parameters: Only takes trades with 20-pip stop loss and 60-pip take profit

Position Sizing
When a flag pattern trade is identified, the system calculates:

Risk Amount: 2% of account balance
Lot Size: Based on risk amount and fixed 20-pip stop loss
Standard Lot Size: Uses 0.1 lots per £1000 in account balance
Take Profit: Fixed at 60 pips (3x the stop loss)
MT4 Instructions: Provides exact entry, stop loss, and take profit prices

Trading Schedule

## Real-Time Analysis & Next Check Recommendations

- **24/5 Operation**: Works anytime forex markets are open
- **On-Demand Analysis**: Analyze any pair with real-time data when you need it
- **Smart Next Check Recommendations**: The system suggests when to check back based on the current pattern status:
  - 1 hour if a breakout has occurred (waiting for pullback)
  - 2 hours if consolidation is detected (waiting for breakout)
  - 1 hour if a valid trade setup is found (for monitoring)
  - 4 hours if no pattern is forming (default)
- **Context-Aware Reasoning**: Explains why you should check back at the suggested time

Project Structure
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
News Sources

Bloomberg Markets
MarketWatch
CNBC Forex
Investing.com
ForexLive
FXStreet
TradingView

Risk Management

2% Risk Rule: Never risk more than 2% per trade
Fixed Stop Loss: Maximum 20 pips
Fixed Take Profit: 60 pips
Risk-Reward Ratio: Fixed at 1:3
Lot Size Scaling: Increases with account growth

Important Notes

This tool provides analysis but doesn't guarantee profits
Past performance doesn't indicate future results
Forex trading involves significant risk
Always use proper risk management
The system only takes trades that fit our strict criteria
Most signals will be "WAIT" - this is intentional for safety
Currency-specific pip values are automatically calculated

Best Practices

Start Small: Begin with minimum position sizes
Paper Trade First: Test the system without real money
Follow the System: Don't override the trade criteria
Risk Management: Stick to 2% risk per trade
Multiple Pairs: Monitor all currency pairs for opportunities
Be Patient: Flag patterns with pullback entries are high-quality but rare setups
# Forex Trading Assistant

A comprehensive multi-currency trading analysis tool that combines technical indicators, news sentiment, and economic calendar data to provide trading decisions for 7 major forex pairs. The system works 24/5 and can be used at any time during forex market hours.

## Features

- **Multi-Currency Support**: Analyze EUR/USD, GBP/USD, AUD/USD, NZD/USD, GBP/JPY, USD/ZAR, EUR/GBP
- **Real-time Market Analysis**: Analyze any currency pair at any time of day
- **15+ Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages, ATR, ADX, CCI, Williams %R, Stochastic, MFI, Parabolic SAR, and more
- **News Sentiment Analysis**: Aggregates and analyzes news from 8+ financial sources with currency-specific filtering
- **Economic Calendar Integration**: Tracks high-impact events that affect trading
- **Position Sizing Calculator**: Calculates lot sizes, stop losses, and take profits for £50 profit target per trade
- **Risk Management**: Built-in 2% risk per trade with automatic position sizing
- **80% Confidence Threshold**: Only recommends trades with high probability setups
- **Multi-Session Support**: Works for London open, US open, or any time analysis

## Supported Currency Pairs

- EUR/USD (Euro/US Dollar)
- GBP/USD (British Pound/US Dollar)
- AUD/USD (Australian Dollar/US Dollar)
- NZD/USD (New Zealand Dollar/US Dollar)
- GBP/JPY (British Pound/Japanese Yen)
- USD/ZAR (US Dollar/South African Rand)
- EUR/GBP (Euro/British Pound)

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React 19
- **Charts**: Recharts
- **APIs**: 
  - Twelve Data (forex prices)
  - Multiple RSS feeds (news)
  - Economic calendars
- **Technical Analysis**: technicalindicators library

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd forex-trading-assistant

Install backend dependencies:

bashcd backend
npm install

Install frontend dependencies:

bashcd ../frontend
npm install --legacy-peer-deps

Set up environment variables:

Create a .env file in the backend directory
Add your API keys:



envPORT=5000
TWELVE_DATA_API_KEY=your_twelve_data_api_key_here
TIMEZONE=Asia/Jerusalem

Get API keys:

Sign up for a free Twelve Data account at https://twelvedata.com/
Add your API key to the .env file



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

Select Currency Pair: Click on any of the 7 available pairs
Anytime Analysis: Click "Analyze [Pair] Now" for current market conditions
Session-Specific Analysis: Use "London Open" or "US Open" buttons
Account Settings: Set your account balance and profit target (default £50 per trade)
Trading Decision: System will show:

BUY/SELL/WAIT decision
Confidence level (must be ≥80% to trade)
Position sizing calculations
Stop loss and take profit levels (in pips)
Exact lot size to trade
Risk/Reward ratio



Position Sizing Example
For a £1,000 account with £50 profit target:

Risk: £20 (2% of account)
Stop Loss: 10 pips
Take Profit: Calculated to achieve £50 profit
Lot Size: Automatically calculated based on currency pair

Trading Schedule

24/5 Operation: Works anytime forex markets are open
Automatic Analysis: Scheduled for 9:30 AM Israel time (London open) for all pairs
Manual Analysis: Available anytime via "Analyze Now" button
Best Times:

London open (10 AM Israel)
US open (3:30 PM Israel)
London/NY overlap (highest liquidity)



Trading Decision Logic
The system only recommends trades when:

Technical indicators and news sentiment align in the same direction
Confidence level is 80% or higher
No high-impact economic events are imminent
Market conditions are favorable

Position Sizing
When a trade is recommended, the system calculates:

Lot Size: Based on 2% risk and currency pair pip value
Stop Loss: Conservative 10 pip default
Take Profit: Calculated to achieve £50 profit target
Required Pips: How many pips needed to reach £50 profit
Risk/Reward Ratio: Automatic calculation
MT4 Instructions: Step-by-step setup guide

Project Structure
forex-trading-assistant/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── priceDataService.js         # Forex price data fetching
│   │   │   ├── technicalAnalysisService.js # 15+ technical indicators
│   │   │   ├── newsAnalysisService.js      # Multi-source news sentiment
│   │   │   ├── economicCalendarService.js  # Economic events tracking
│   │   │   ├── positionCalculator.js       # Position sizing logic
│   │   │   └── analysisEngine.js           # Main decision engine
│   │   ├── config/
│   │   │   └── apiConfig.js               # API configurations
│   │   ├── utils/
│   │   │   └── helpers.js                 # Utility functions
│   │   └── index.js                       # Express server
│   ├── .env                               # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js               # Main dashboard
│   │   │   ├── PriceChart.js              # Live price chart
│   │   │   ├── TechnicalIndicators.js     # All indicators display
│   │   │   ├── NewsSection.js             # News feed & sentiment
│   │   │   ├── EconomicCalendar.js        # Economic events
│   │   │   ├── PositionSizing.js          # Trade calculations
│   │   │   └── AccountSettings.js         # Account configuration
│   │   ├── App.js                         # Main app component
│   │   ├── App.css                        # Styles
│   │   └── index.js                       # Entry point
│   └── package.json
└── README.md
Technical Indicators Used

Trend: SMA (20, 50, 200), EMA (9, 21)
Momentum: RSI, Stochastic, CCI, Williams %R
Volatility: Bollinger Bands, ATR
Trend Strength: ADX
Volume: MFI, OBV
Trend Reversal: MACD, Parabolic SAR

News Sources

Bloomberg Markets
MarketWatch
CNBC Forex
Investing.com
ForexLive
FXStreet
TradingView
Forex.com

Risk Management

2% Risk Rule: Never risk more than 2% per trade
Position Sizing: Automatic calculation based on stop loss
80% Confidence: High threshold for trade signals
Risk Warnings: Alerts for unrealistic profit targets
Stop Loss: Always calculated and displayed
Profit Target: £50 per trade (5% on £1,000 account)

Important Notes

This tool provides analysis but doesn't guarantee profits
Past performance doesn't indicate future results
Forex trading involves significant risk
Always use proper risk management
The system requires 80% confidence to recommend trades
Most signals will be "WAIT" - this is intentional for safety
Currency-specific pip values are automatically calculated

Common Issues & Solutions

No position sizing shown:

Only appears when system recommends a trade (BUY/SELL)
WAIT decisions don't show position sizing


Low confidence readings:

Normal during consolidation or mixed signals
System is designed to be conservative


News feed errors:

Some RSS feeds may be temporarily down
System continues with available sources


Weekend operation:

Shows Friday's closing data
Economic calendar empty
May have lower confidence due to stale data



Best Practices

Start Small: Begin with minimum position sizes
Paper Trade First: Test the system without real money
Follow the System: Don't override the 80% threshold
Risk Management: Stick to 2% risk per trade
Multiple Pairs: Monitor all currency pairs for opportunities
Realistic Targets: £50 per trade is sustainable (5% return)

MT4 Integration
The system provides exact instructions for MT4:

Currency pair to trade
Trade direction (Buy/Sell)
Lot size calculation
Stop loss in pips
Take profit in pips

Disclaimer
This software is for educational and informational purposes only. Trading forex carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade forex, you should carefully consider your investment objectives, level of experience, and risk appetite. Past performance is not indicative of future results.
Support
For issues or questions:

Check the troubleshooting section
Review the console for error messages
Ensure all API keys are properly configured
Verify market hours for live data

Future Enhancements

 Additional currency pairs
 Backtesting functionality
 Performance tracking
 Multiple timeframe analysis
 Custom indicator parameters
 Trade journal integration
 Mobile responsive design
 Email/SMS alerts
 Automated trading execution

License
MIT License
Version
2.0.0 - Multi-currency support with realistic profit targets and enhanced risk management
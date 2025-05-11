# EUR/USD Trading Assistant

A local web application that analyzes EUR/USD forex market conditions at the London market open to provide trading recommendations based on technical indicators, news sentiment, and economic calendar events.

## Features

- **Real-time Analysis**: Fetches live forex data, news, and economic events
- **Technical Analysis**: Calculates RSI, MACD, Bollinger Bands, Moving Averages, ATR, and Stochastic indicators
- **News Sentiment**: Analyzes financial news from Bloomberg, Yahoo Finance, ForexLive, and FXStreet
- **Economic Calendar**: Tracks high-impact events that could affect trading
- **Trading Recommendations**: Provides BUY/SELL/WAIT decisions with confidence levels
- **Risk Assessment**: Identifies potential risks and market conditions

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React
- **APIs**: Twelve Data (forex prices), RSS feeds (news), Economic calendars
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
npm install

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

Start the backend server:

bashcd backend
npm run dev

Start the frontend (in a new terminal):

bashcd frontend
npm start

Open your browser to http://localhost:3000

Trading Schedule

Automatic Analysis: Runs daily at 9:30 AM Israel time (30 minutes before London open)
Manual Analysis: Click "Run Analysis Now" button anytime
London Open: 10:00 AM Israel time
Trading Window: 10:00-10:15 AM Israel time

How It Works

Data Collection (9:30 AM):

Fetches latest EUR/USD price data
Retrieves financial news articles
Checks economic calendar for events


Analysis:

Calculates technical indicators
Analyzes news sentiment
Evaluates economic events impact


Decision Engine:

Combines technical and fundamental analysis
Weighs signals based on alignment
Provides confidence-scored recommendations


Output (9:55 AM):

Direction: BUY/SELL/WAIT
Confidence: 0-100%
Reasoning: Detailed explanation
Risks: Potential concerns



Project Structure
forex-trading-assistant/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── priceDataService.js      # Forex price data
│   │   │   ├── technicalAnalysisService.js  # Technical indicators
│   │   │   ├── newsAnalysisService.js   # News sentiment
│   │   │   ├── economicCalendarService.js  # Economic events
│   │   │   └── analysisEngine.js        # Decision logic
│   │   ├── config/
│   │   │   └── apiConfig.js            # API configurations
│   │   ├── utils/
│   │   │   └── helpers.js              # Utility functions
│   │   └── index.js                    # Express server
│   ├── .env                            # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js            # Main dashboard
│   │   │   ├── PriceChart.js           # Price chart
│   │   │   ├── TechnicalIndicators.js  # Indicators display
│   │   │   ├── NewsSection.js          # News display
│   │   │   └── EconomicCalendar.js     # Calendar display
│   │   ├── App.js                      # Main app component
│   │   ├── App.css                     # Styles
│   │   └── index.js                    # Entry point
│   └── package.json
└── README.md
API Limits

Twelve Data: 800 API calls/day (free tier)
News RSS: Unlimited (public feeds)
Economic Calendar: Limited by provider

Important Notes

This tool provides analysis but doesn't guarantee profitable trades
Always use proper risk management
Market conditions can change rapidly
Technical indicators are based on historical data
News sentiment analysis is algorithmic and may not capture all nuances

Troubleshooting

No data displayed:

Check your Twelve Data API key
Ensure backend server is running
Check console for errors


Analysis not updating:

Scheduled analysis only runs on weekdays
Use "Run Analysis Now" for manual updates


Weekend operation:

Shows Friday's closing data on weekends
Economic calendar empty on weekends
News feeds may have limited weekend updates



Disclaimer
This application is for educational and analytical purposes only. Trading forex carries significant risk and may not be suitable for all investors. Always conduct your own research and consider your financial situation before trading.
Development

Backend runs on port 5000
Frontend runs on port 3000
Uses ES6+ JavaScript
React 19 with functional components
Express.js REST API

Future Enhancements

 Add more currency pairs
 Include additional trading sessions
 Implement backtesting
 Add performance tracking
 Include more technical indicators
 Enhance news sentiment analysis
 Add AI/ML predictions

License
MIT License
Support
For issues or questions, please check the troubleshooting section or create an issue in the repository.

This README provides comprehensive documentation for your project. It includes:
- Project overview
- Installation instructions
- Usage guide
- Technical details
- Troubleshooting tips
- Important disclaimers

Place this file in your main project directory (`C:\Users\User\Desktop\forex-trading-assistant\README.md`).
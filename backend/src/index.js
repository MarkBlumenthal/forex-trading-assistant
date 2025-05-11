require('dotenv').config();
const express = require('express');
const { runAnalysis } = require('./services/analysisEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());

// Store latest analysis for each currency pair
let analysisCache = {};

// Default account settings - now with £50 target per trade
let defaultAccountSettings = {
  accountBalance: 1000,  // £1000
  targetProfit: 50       // £50 per trade (5% return)
};

// API endpoint to get available currency pairs
app.get('/api/currency-pairs', (req, res) => {
  const pairs = ['EUR/USD', 'GBP/USD', 'AUD/USD', 'NZD/USD', 'GBP/JPY', 'USD/ZAR', 'EUR/GBP'];
  res.json(pairs);
});

// API endpoint to get latest analysis for a specific pair
app.get('/api/analysis', (req, res) => {
  const pair = req.query.pair;
  if (!pair) {
    res.status(400).json({ error: 'Currency pair required' });
    return;
  }
  
  if (analysisCache[pair]) {
    res.json(analysisCache[pair]);
  } else {
    res.json({ message: 'No analysis available yet for ' + pair });
  }
});

// API endpoint to trigger analysis for a specific currency pair
app.post('/api/analyze-now', async (req, res) => {
  try {
    const { 
      currencyPair = 'EUR/USD', 
      timeframe = 'current', 
      accountSettings = defaultAccountSettings 
    } = req.body;
    
    console.log(`Manual analysis triggered for ${currencyPair} at ${timeframe}`);
    const analysis = await runAnalysis(currencyPair, timeframe, accountSettings);
    analysisCache[currencyPair] = analysis;
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// API endpoint to update account settings
app.post('/api/account-settings', (req, res) => {
  const { accountBalance, targetProfit } = req.body;
  if (accountBalance && targetProfit) {
    defaultAccountSettings.accountBalance = accountBalance;
    defaultAccountSettings.targetProfit = targetProfit;
    res.json({ message: 'Account settings updated', settings: defaultAccountSettings });
  } else {
    res.status(400).json({ error: 'Invalid account settings' });
  }
});

// Simple scheduler that checks every minute
function scheduleAnalysis() {
  setInterval(async () => {
    const now = new Date();
    const israelTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jerusalem"}));
    const hours = israelTime.getHours();
    const minutes = israelTime.getMinutes();
    const day = israelTime.getDay();
    
    // Run at 9:30 AM on weekdays (Monday = 1, Friday = 5)
    if (hours === 9 && minutes === 30 && day >= 1 && day <= 5) {
      console.log('Running scheduled analysis...');
      try {
        // Run analysis for all currency pairs
        const pairs = ['EUR/USD', 'GBP/USD', 'AUD/USD', 'NZD/USD', 'GBP/JPY', 'USD/ZAR', 'EUR/GBP'];
        for (const pair of pairs) {
          const analysis = await runAnalysis(pair, 'london-open', defaultAccountSettings);
          analysisCache[pair] = analysis;
          console.log(`Completed analysis for ${pair}`);
        }
      } catch (error) {
        console.error('Scheduled analysis error:', error);
      }
    }
  }, 60000); // Check every minute
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Analysis scheduled for 9:30 AM Israel time on weekdays');
  
  // Start the scheduler
  scheduleAnalysis();
  
  // Show current time for debugging
  const now = new Date();
  console.log(`Current time: ${now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })}`);
});
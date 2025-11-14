require('dotenv').config();
const express = require('express');
const { runAnalysis } = require('./services/analysisEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
// Enable CORS for frontend (dev + production)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});


app.use(express.json());

// Store latest analysis for each currency pair
let analysisCache = {};

// Default account settings
let defaultAccountSettings = {
  accountBalance: 1000,  // £1000
  targetProfit: 50       // £50 per trade (5% return)
};

// API endpoint to get available currency pairs
app.get('/api/currency-pairs', (req, res) => {
  // Updated currency pairs list
  const pairs = [
    'EUR/USD', 
    'USD/JPY', 
    'GBP/USD', 
    'AUD/USD', 
    'NZD/USD', 
    'EUR/GBP', 
    'USD/CHF', 
    'EUR/JPY', 
    'USD/CAD', 
    'GBP/JPY'
  ];
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
    
    console.log(`Manual analysis triggered for ${currencyPair}`);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Real-time analysis available - click "Analyze Now" button to check any pair');
  
  // Show current time for debugging
  const now = new Date();
  console.log(`Current time: ${now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })}`);
});
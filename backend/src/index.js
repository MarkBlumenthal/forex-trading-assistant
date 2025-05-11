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

// Store latest analysis
let latestAnalysis = null;

// Default account settings
let defaultAccountSettings = {
  accountBalance: 1000,  // £1000
  monthlyTarget: 6500    // £6500
};

// API endpoint to get latest analysis
app.get('/api/analysis', (req, res) => {
  if (latestAnalysis) {
    res.json(latestAnalysis);
  } else {
    res.json({ message: 'No analysis available yet' });
  }
});

// API endpoint to trigger analysis manually with options
app.post('/api/analyze-now', async (req, res) => {
  try {
    const { timeframe = 'current', accountSettings = defaultAccountSettings } = req.body;
    console.log(`Manual analysis triggered for ${timeframe}`);
    latestAnalysis = await runAnalysis(timeframe, accountSettings);
    res.json(latestAnalysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// API endpoint to update account settings
app.post('/api/account-settings', (req, res) => {
  const { accountBalance, monthlyTarget } = req.body;
  if (accountBalance && monthlyTarget) {
    defaultAccountSettings.accountBalance = accountBalance;
    defaultAccountSettings.monthlyTarget = monthlyTarget;
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
        latestAnalysis = await runAnalysis('london-open', defaultAccountSettings);
        console.log('Scheduled analysis completed');
      } catch (error) {
        console.error('Scheduled analysis error:', error);
      }
    }
  }, 60000); // Check every minute
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Analysis scheduled for 9:30 AM Israel time on weekdays');
  
  // Start the simple scheduler
  scheduleAnalysis();
  
  // Show current time for debugging
  const now = new Date();
  console.log(`Current time: ${now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })}`);
});
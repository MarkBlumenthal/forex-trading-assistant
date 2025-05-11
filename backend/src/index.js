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

// API endpoint to get latest analysis
app.get('/api/analysis', (req, res) => {
  if (latestAnalysis) {
    res.json(latestAnalysis);
  } else {
    res.json({ message: 'No analysis available yet' });
  }
});

// API endpoint to trigger analysis manually
app.get('/api/analyze-now', async (req, res) => {
  try {
    console.log('Manual analysis triggered');
    latestAnalysis = await runAnalysis();
    res.json(latestAnalysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Simple scheduler without cron
function scheduleAnalysis() {
  setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDay();
    
    // Run at 9:30 AM on weekdays (Monday = 1, Friday = 5)
    if (hours === 9 && minutes === 30 && day >= 1 && day <= 5) {
      console.log('Running scheduled analysis...');
      runAnalysis()
        .then(result => {
          latestAnalysis = result;
          console.log('Scheduled analysis completed');
        })
        .catch(error => {
          console.error('Scheduled analysis error:', error);
        });
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
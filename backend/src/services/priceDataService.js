const axios = require('axios');
require('dotenv').config();

// Sign up for free at https://twelvedata.com/
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || 'demo';

async function getForexData(fromSymbol = 'EUR', toSymbol = 'USD', interval = '15min') {
  try {
    // Twelve Data API for real forex data
    const response = await axios.get('https://api.twelvedata.com/time_series', {
      params: {
        symbol: `${fromSymbol}/${toSymbol}`,
        interval,
        apikey: TWELVE_DATA_API_KEY,
        outputsize: 100, // Get last 100 data points
        timezone: 'Asia/Jerusalem'
      }
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message);
    }

    // Convert to our format
    const prices = response.data.values.map(item => ({
      time: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close)
    }));

    return prices.reverse(); // Most recent last
  } catch (error) {
    console.error('Error fetching forex data:', error.message);
    
    // Try alternative: Alpha Vantage
    return getAlternativeForexData(fromSymbol, toSymbol);
  }
}

async function getAlternativeForexData(fromSymbol = 'EUR', toSymbol = 'USD') {
  try {
    // Alpha Vantage as backup
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'FX_INTRADAY',
        from_symbol: fromSymbol,
        to_symbol: toSymbol,
        interval: '15min',
        apikey: 'demo', // Limited calls with demo key
        outputsize: 'compact'
      }
    });

    if (response.data.Note) {
      throw new Error('Alpha Vantage rate limit reached');
    }

    const timeSeries = response.data['Time Series FX (15min)'];
    
    if (!timeSeries) {
      throw new Error('No data available from Alpha Vantage');
    }

    const prices = Object.entries(timeSeries).map(([time, data]) => ({
      time,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close'])
    }));

    return prices.reverse();
  } catch (error) {
    console.error('Alternative data fetch failed:', error);
    throw new Error('Unable to fetch forex data from any source');
  }
}

module.exports = { getForexData };
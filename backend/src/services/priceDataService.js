const axios = require('axios');
require('dotenv').config();

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || 'demo';

async function getForexData(fromSymbol = 'EUR', toSymbol = 'USD', interval = '1h') {
  try {
    // Convert our interval format to Twelve Data format
    const twelveDataInterval = mapIntervalToTwelveData(interval);
    
    // Twelve Data API for real forex data
    const response = await axios.get('https://api.twelvedata.com/time_series', {
      params: {
        symbol: `${fromSymbol}/${toSymbol}`,
        interval: twelveDataInterval,
        apikey: TWELVE_DATA_API_KEY,
        outputsize: 150, // Get more data points for pattern recognition
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
      close: parseFloat(item.close),
      volume: parseFloat(item.volume || 0)
    }));

    return prices.reverse(); // Most recent last
  } catch (error) {
    console.error('Error fetching forex data:', error.message);
    
    // Try alternative: Alpha Vantage
    return getAlternativeForexData(fromSymbol, toSymbol, interval);
  }
}

async function getAlternativeForexData(fromSymbol = 'EUR', toSymbol = 'USD', interval = '1h') {
  try {
    // Map our interval format to Alpha Vantage format
    const avInterval = mapIntervalToAlphaVantage(interval);
    
    // Alpha Vantage as backup
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'FX_INTRADAY',
        from_symbol: fromSymbol,
        to_symbol: toSymbol,
        interval: avInterval,
        apikey: 'demo', // Limited calls with demo key
        outputsize: 'full'
      }
    });

    if (response.data.Note) {
      throw new Error('Alpha Vantage rate limit reached');
    }

    const timeSeries = response.data[`Time Series FX (${avInterval})`];
    
    if (!timeSeries) {
      throw new Error('No data available from Alpha Vantage');
    }

    const prices = Object.entries(timeSeries).map(([time, data]) => ({
      time,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: 0 // Alpha Vantage doesn't provide volume for forex
    }));

    return prices.reverse();
  } catch (error) {
    console.error('Alternative data fetch failed:', error);
    throw new Error('Unable to fetch forex data from any source');
  }
}

// Helper function to map our interval format to Twelve Data format
function mapIntervalToTwelveData(interval) {
  switch (interval) {
    case '4hour': return '4h';
    case '1hour': return '1h';
    default: return '1h';
  }
}

// Helper function to map our interval format to Alpha Vantage format
function mapIntervalToAlphaVantage(interval) {
  switch (interval) {
    case '4hour': return '240min';
    case '1hour': return '60min';
    default: return '60min';
  }
}

// New function to fetch data for 4h and 1h timeframes
async function getMultiTimeframeData(fromSymbol, toSymbol) {
  try {
    // Fetch data for required timeframes
    const [fourHourData, oneHourData] = await Promise.all([
      getForexData(fromSymbol, toSymbol, '4hour'),
      getForexData(fromSymbol, toSymbol, '1hour'),
    ]);
    
    return {
      fourHour: fourHourData,
      oneHour: oneHourData
    };
  } catch (error) {
    console.error('Error fetching multi-timeframe data:', error);
    throw error;
  }
}

// Get pip value for different pairs
function getPipValue(fromSymbol, toSymbol, currentPrice) {
  // For most pairs, 1 pip = 0.0001
  // For JPY pairs, 1 pip = 0.01
  const isJPYPair = toSymbol === 'JPY' || fromSymbol === 'JPY';
  const pipSize = isJPYPair ? 0.01 : 0.0001;
  
  // Standard lot size = 100,000 units
  // Calculate pip value in account currency (GBP)
  if (toSymbol === 'GBP') {
    // Direct GBP quote
    return 100000 * pipSize;
  } else if (fromSymbol === 'GBP') {
    // GBP is base currency
    return 100000 * pipSize / currentPrice;
  } else {
    // Need to convert to GBP
    // Simplified calculation - in production, you'd need current exchange rates
    const estimatedGBPRate = 0.78; // USD to GBP approximation
    return 100000 * pipSize * estimatedGBPRate;
  }
}

module.exports = { 
  getForexData,
  getMultiTimeframeData,
  getPipValue
};
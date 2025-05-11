module.exports = {
    alphaVantage: {
      baseUrl: 'https://www.alphavantage.co/query',
      apiKey: process.env.ALPHA_VANTAGE_API_KEY || 'demo'
    },
    newsApi: {
      baseUrl: 'https://newsapi.org/v2',
      apiKey: process.env.NEWSAPI_KEY
    },
    exchangeRate: {
      baseUrl: 'https://api.exchangerate-api.com/v4/latest/EUR'
    }
  };
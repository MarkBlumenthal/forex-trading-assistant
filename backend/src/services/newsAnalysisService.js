const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

// Currency keywords for news filtering
const CURRENCY_KEYWORDS = {
  EUR: ['eur', 'euro', 'ecb', 'eurozone', 'european central bank', 'eu economy'],
  USD: ['usd', 'dollar', 'fed', 'federal reserve', 'fomc', 'us economy', 'greenback'],
  GBP: ['gbp', 'pound', 'sterling', 'boe', 'bank of england', 'uk economy', 'brexit'],
  AUD: ['aud', 'aussie', 'australian dollar', 'rba', 'reserve bank of australia', 'australia economy'],
  NZD: ['nzd', 'kiwi', 'new zealand dollar', 'rbnz', 'reserve bank of new zealand', 'nz economy'],
  JPY: ['jpy', 'yen', 'boj', 'bank of japan', 'japan economy', 'japanese yen'],
  ZAR: ['zar', 'rand', 'south african rand', 'sarb', 'south africa economy', 'sa economy']
};

async function getMarketNews(currencyPair = 'EUR/USD') {
  try {
    const [baseCurrency, quoteCurrency] = currencyPair.split('/');
    const news = await getFinancialNews(baseCurrency, quoteCurrency);
    const sentiment = analyzeNewsSentiment(news, baseCurrency, quoteCurrency);
    
    return {
      articles: news,
      sentiment,
      keyEvents: extractKeyEvents(news),
      currencyPair
    };
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return {
      articles: [],
      sentiment: 'NEUTRAL',
      keyEvents: [],
      currencyPair
    };
  }
}

async function getFinancialNews(baseCurrency, quoteCurrency) {
  try {
    const newsArticles = [];
    
    // Updated working news feeds
    const feeds = [
      { url: 'https://feeds.bloomberg.com/markets/news.rss', name: 'Bloomberg' },
      { url: 'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines', name: 'MarketWatch' },
      { url: 'https://www.investing.com/rss/news.rss', name: 'Investing.com' },
      { url: 'https://www.forexlive.com/feed/news', name: 'ForexLive' },
      { url: 'https://www.fxstreet.com/rss/news', name: 'FXStreet' },
      { url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html', name: 'CNBC Forex' },
      { url: 'https://www.tradingview.com/feed/', name: 'TradingView' },
      { url: 'https://www.forex.com/en-us/feed/', name: 'Forex.com' }
    ];

    // Parse RSS feeds
    for (const feed of feeds) {
      try {
        console.log(`Fetching ${feed.name}...`);
        const parsedFeed = await parser.parseURL(feed.url);
        const relevantArticles = parsedFeed.items
          .slice(0, 5) // Get latest 5 from each feed
          .filter(item => {
            const text = (item.title + ' ' + (item.contentSnippet || item.content || '')).toLowerCase();
            
            // Check if article mentions either currency
            const baseKeywords = CURRENCY_KEYWORDS[baseCurrency] || [];
            const quoteKeywords = CURRENCY_KEYWORDS[quoteCurrency] || [];
            
            const mentionsBase = baseKeywords.some(keyword => text.includes(keyword));
            const mentionsQuote = quoteKeywords.some(keyword => text.includes(keyword));
            
            return mentionsBase || mentionsQuote || text.includes('forex') || text.includes('fx');
          })
          .map(item => ({
            title: item.title,
            description: item.contentSnippet || item.content || '',
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            link: item.link,
            source: feed.name
          }));
        
        newsArticles.push(...relevantArticles);
      } catch (feedError) {
        console.error(`Error parsing ${feed.name}:`, feedError.message);
      }
    }

    // Sort by date and analyze
    return newsArticles
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 20) // Keep top 20 most recent
      .map(article => ({
        ...article,
        sentiment: analyzeSingleArticle(article, baseCurrency, quoteCurrency),
        impact: determineImpact(article)
      }));
    
  } catch (error) {
    console.error('News fetch error:', error);
    throw error;
  }
}

function analyzeSingleArticle(article, baseCurrency, quoteCurrency) {
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  // Dynamic sentiment analysis based on currency pair
  const basePositive = [
    `${baseCurrency.toLowerCase()} strength`, 
    `${baseCurrency.toLowerCase()} gains`, 
    `${baseCurrency.toLowerCase()} rally`,
    `${baseCurrency.toLowerCase()} rises`,
    `${baseCurrency.toLowerCase()} advance`
  ];
  const baseNegative = [
    `${baseCurrency.toLowerCase()} weakness`, 
    `${baseCurrency.toLowerCase()} falls`, 
    `${baseCurrency.toLowerCase()} decline`,
    `${baseCurrency.toLowerCase()} drops`,
    `${baseCurrency.toLowerCase()} retreat`
  ];
  const quotePositive = [
    `${quoteCurrency.toLowerCase()} strength`, 
    `${quoteCurrency.toLowerCase()} gains`, 
    `${quoteCurrency.toLowerCase()} rally`,
    `${quoteCurrency.toLowerCase()} rises`,
    `${quoteCurrency.toLowerCase()} advance`
  ];
  const quoteNegative = [
    `${quoteCurrency.toLowerCase()} weakness`, 
    `${quoteCurrency.toLowerCase()} falls`, 
    `${quoteCurrency.toLowerCase()} decline`,
    `${quoteCurrency.toLowerCase()} drops`,
    `${quoteCurrency.toLowerCase()} retreat`
  ];
  
  let baseScore = 0;
  let quoteScore = 0;
  
  basePositive.forEach(keyword => { if (text.includes(keyword)) baseScore += 2; });
  baseNegative.forEach(keyword => { if (text.includes(keyword)) baseScore -= 2; });
  quotePositive.forEach(keyword => { if (text.includes(keyword)) quoteScore += 2; });
  quoteNegative.forEach(keyword => { if (text.includes(keyword)) quoteScore -= 2; });
  
  if (baseScore > quoteScore) return `${baseCurrency}_POSITIVE`;
  if (quoteScore > baseScore) return `${quoteCurrency}_POSITIVE`;
  return 'NEUTRAL';
}

function determineImpact(article) {
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  const highImpact = ['central bank', 'interest rate', 'monetary policy', 'inflation data', 
                      'nfp', 'non-farm', 'gdp', 'crisis', 'emergency', 'breaking',
                      'rate decision', 'policy meeting'];
  
  const mediumImpact = ['economic data', 'manufacturing', 'pmi', 'consumer', 'retail',
                        'employment', 'trade', 'industrial', 'sentiment', 'confidence'];
  
  for (const keyword of highImpact) {
    if (text.includes(keyword)) return 'HIGH';
  }
  
  for (const keyword of mediumImpact) {
    if (text.includes(keyword)) return 'MEDIUM';
  }
  
  return 'LOW';
}

function analyzeNewsSentiment(articles, baseCurrency, quoteCurrency) {
  let baseScore = 0;
  let quoteScore = 0;

  articles.forEach(article => {
    const weight = article.impact === 'HIGH' ? 3 : article.impact === 'MEDIUM' ? 2 : 1;
    
    if (article.sentiment === `${baseCurrency}_POSITIVE`) baseScore += weight;
    if (article.sentiment === `${quoteCurrency}_POSITIVE`) quoteScore += weight;
  });

  const netScore = baseScore - quoteScore;
  
  if (netScore > 3) return 'BULLISH';
  if (netScore < -3) return 'BEARISH';
  return 'NEUTRAL';
}

function extractKeyEvents(articles) {
  return articles
    .filter(article => article.impact === 'HIGH')
    .map(article => ({
      title: article.title,
      impact: article.impact,
      time: article.publishedAt,
      sentiment: article.sentiment
    }));
}

module.exports = {
  getMarketNews,
  analyzeNewsSentiment
};
const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

async function getMarketNews() {
  try {
    const news = await getFinancialNews();
    const sentiment = analyzeNewsSentiment(news);
    
    return {
      articles: news,
      sentiment,
      keyEvents: extractKeyEvents(news)
    };
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return {
      articles: [],
      sentiment: 'NEUTRAL',
      keyEvents: []
    };
  }
}

async function getFinancialNews() {
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
            return text.includes('eur') || text.includes('usd') || 
                   text.includes('euro') || text.includes('dollar') ||
                   text.includes('ecb') || text.includes('fed') ||
                   text.includes('forex') || text.includes('fx');
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
        sentiment: analyzeSingleArticle(article),
        impact: determineImpact(article)
      }));
    
  } catch (error) {
    console.error('News fetch error:', error);
    throw error;
  }
}

function analyzeSingleArticle(article) {
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  // Enhanced keyword analysis
  const eurPositive = ['ecb hawkish', 'eurozone recovery', 'euro strength', 'euro gains', 
                       'euro rises', 'eur bullish', 'eurozone growth', 'ecb rate hike',
                       'euro rally', 'eur/usd up', 'euro advance', 'eurozone improvement'];
  const eurNegative = ['ecb dovish', 'eurozone weakness', 'euro falls', 'euro pressure',
                       'euro drops', 'eur bearish', 'eurozone recession', 'ecb rate cut',
                       'euro decline', 'eur/usd down', 'euro retreat', 'eurozone slowdown'];
  const usdPositive = ['fed hawkish', 'dollar strength', 'usd gains', 'strong us data',
                       'dollar rises', 'usd bullish', 'fed rate hike', 'us growth',
                       'dollar rally', 'greenback advance', 'usd advance', 'us economy strong'];
  const usdNegative = ['fed dovish', 'dollar weakness', 'usd falls', 'weak us data',
                       'dollar drops', 'usd bearish', 'fed rate cut', 'us recession',
                       'dollar decline', 'greenback retreat', 'usd retreat', 'us slowdown'];
  
  let eurScore = 0;
  let usdScore = 0;
  
  eurPositive.forEach(keyword => { if (text.includes(keyword)) eurScore += 2; });
  eurNegative.forEach(keyword => { if (text.includes(keyword)) eurScore -= 2; });
  usdPositive.forEach(keyword => { if (text.includes(keyword)) usdScore += 2; });
  usdNegative.forEach(keyword => { if (text.includes(keyword)) usdScore -= 2; });
  
  // Additional general forex indicators
  if (text.includes('eur/usd')) {
    if (text.includes('buy') || text.includes('long')) eurScore += 1;
    if (text.includes('sell') || text.includes('short')) eurScore -= 1;
  }
  
  if (eurScore > usdScore) return 'EUR_POSITIVE';
  if (usdScore > eurScore) return 'USD_POSITIVE';
  return 'NEUTRAL';
}

function determineImpact(article) {
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  const highImpact = ['central bank', 'interest rate', 'monetary policy', 'inflation data', 
                      'nfp', 'non-farm', 'gdp', 'crisis', 'emergency', 'breaking',
                      'ecb decision', 'fed decision', 'fomc', 'policy meeting'];
  
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

function analyzeNewsSentiment(articles) {
  let eurScore = 0;
  let usdScore = 0;

  articles.forEach(article => {
    const weight = article.impact === 'HIGH' ? 3 : article.impact === 'MEDIUM' ? 2 : 1;
    
    if (article.sentiment === 'EUR_POSITIVE') eurScore += weight;
    if (article.sentiment === 'USD_POSITIVE') usdScore += weight;
  });

  const netScore = eurScore - usdScore;
  
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
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
    
    // Fetch from multiple RSS feeds
    const feeds = [
      'https://feeds.bloomberg.com/markets/news.rss',
      'https://finance.yahoo.com/rss',
      'https://www.forexlive.com/feed/news',
      'https://www.fxstreet.com/rss/news'
    ];

    // Parse RSS feeds
    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const relevantArticles = feed.items
          .slice(0, 5) // Get latest 5 from each feed
          .filter(item => {
            const text = (item.title + ' ' + item.contentSnippet).toLowerCase();
            return text.includes('eur') || text.includes('usd') || 
                   text.includes('euro') || text.includes('dollar') ||
                   text.includes('ecb') || text.includes('fed');
          })
          .map(item => ({
            title: item.title,
            description: item.contentSnippet || item.content || '',
            publishedAt: item.pubDate || new Date().toISOString(),
            link: item.link,
            source: feedUrl.includes('bloomberg') ? 'Bloomberg' :
                    feedUrl.includes('yahoo') ? 'Yahoo Finance' :
                    feedUrl.includes('forexlive') ? 'ForexLive' : 'FXStreet'
          }));
        
        newsArticles.push(...relevantArticles);
      } catch (feedError) {
        console.error(`Error parsing ${feedUrl}:`, feedError.message);
      }
    }

    // Sort by date and analyze
    return newsArticles
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 10) // Keep top 10 most recent
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
  
  // Keywords for EUR/USD sentiment
  const eurPositive = ['ecb hawkish', 'eurozone recovery', 'euro strength', 'euro gains'];
  const eurNegative = ['ecb dovish', 'eurozone weakness', 'euro falls', 'euro pressure'];
  const usdPositive = ['fed hawkish', 'dollar strength', 'usd gains', 'strong us data'];
  const usdNegative = ['fed dovish', 'dollar weakness', 'usd falls', 'weak us data'];
  
  let eurScore = 0;
  let usdScore = 0;
  
  eurPositive.forEach(keyword => { if (text.includes(keyword)) eurScore += 2; });
  eurNegative.forEach(keyword => { if (text.includes(keyword)) eurScore -= 2; });
  usdPositive.forEach(keyword => { if (text.includes(keyword)) usdScore += 2; });
  usdNegative.forEach(keyword => { if (text.includes(keyword)) usdScore -= 2; });
  
  if (eurScore > usdScore) return 'EUR_POSITIVE';
  if (usdScore > eurScore) return 'USD_POSITIVE';
  return 'NEUTRAL';
}

function determineImpact(article) {
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  // High impact keywords
  const highImpact = ['central bank', 'interest rate', 'monetary policy', 'inflation data', 
                      'nfp', 'non-farm', 'gdp', 'crisis', 'emergency'];
  
  // Medium impact keywords
  const mediumImpact = ['economic data', 'manufacturing', 'pmi', 'consumer', 'retail'];
  
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
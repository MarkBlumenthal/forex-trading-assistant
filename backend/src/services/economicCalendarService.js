const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

async function getEconomicCalendar(currencyPair = 'EUR/USD') {
  try {
    // Split the currency pair to get base and quote currencies
    const [baseCurrency, quoteCurrency] = currencyPair ? currencyPair.split('/') : ['EUR', 'USD'];
    
    const events = await fetchEconomicEvents();
    
    // Filter events for the specific currency pair
    const relevantEvents = events.filter(event => 
      event.currency === baseCurrency || event.currency === quoteCurrency
    );
    
    return {
      hasHighImpactEvents: checkHighImpactEvents(relevantEvents),
      events: relevantEvents,
      tradingRecommendation: getCalendarRecommendation(relevantEvents),
      currencyPair: currencyPair // Add currency pair to the response
    };
  } catch (error) {
    console.error('Economic calendar error:', error);
    return {
      hasHighImpactEvents: false,
      events: [],
      tradingRecommendation: 'PROCEED',
      currencyPair: currencyPair // Add currency pair to the response
    };
  }
}

async function fetchEconomicEvents() {
  try {
    // Try ForexFactory RSS first
    const feed = await parser.parseURL('https://www.forexfactory.com/ffcal_week_this.xml');
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const events = feed.items
      .filter(item => {
        const eventDate = new Date(item.pubDate).toISOString().split('T')[0];
        return eventDate === todayStr;
      })
      .map(item => {
        // Parse the title to extract event details
        const title = item.title;
        const impact = determineEventImpact(title);
        const currency = extractCurrency(title);
        
        return {
          name: title,
          time: new Date(item.pubDate).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          impact,
          currency,
          description: item.contentSnippet || ''
        };
      });
    
    return events;
  } catch (error) {
    // Fallback to alternative calendar
    return fetchAlternativeCalendar();
  }
}

async function fetchAlternativeCalendar() {
  try {
    // For development/weekends, return empty array
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // If it's weekend, return empty (no economic events)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('Weekend - no economic events');
      return [];
    }
    
    // Try to fetch from Investing.com RSS
    const feed = await parser.parseURL('https://www.investing.com/economic-calendar/rss');
    
    const events = feed.items
      .filter(item => {
        const eventDate = new Date(item.pubDate).toDateString();
        const today = new Date().toDateString();
        return eventDate === today;
      })
      .map(item => ({
        name: item.title,
        time: new Date(item.pubDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        impact: determineEventImpact(item.title),
        currency: extractCurrency(item.title),
        description: item.contentSnippet || ''
      }));
    
    return events;
  } catch (error) {
    console.error('Alternative calendar fetch failed:', error);
    // Return empty array as fallback
    return [];
  }
}

function determineEventImpact(title) {
  const highImpact = ['interest rate', 'employment', 'gdp', 'inflation', 'cpi', 'nfp', 
                      'fomc', 'ecb', 'central bank', 'non-farm'];
  const mediumImpact = ['pmi', 'retail sales', 'industrial production', 'consumer confidence',
                        'manufacturing', 'services', 'trade balance'];
  
  const lowerTitle = title.toLowerCase();
  
  for (const keyword of highImpact) {
    if (lowerTitle.includes(keyword)) return 'HIGH';
  }
  
  for (const keyword of mediumImpact) {
    if (lowerTitle.includes(keyword)) return 'MEDIUM';
  }
  
  return 'LOW';
}

function extractCurrency(title) {
  const titleUpper = title.toUpperCase();
  
  // EUR related
  if (titleUpper.includes('EUR') || titleUpper.includes('EURO') || 
      titleUpper.includes('ECB') || titleUpper.includes('EUROZONE') ||
      titleUpper.includes('GERMAN') || titleUpper.includes('FRENCH')) {
    return 'EUR';
  }
  
  // USD related
  if (titleUpper.includes('USD') || titleUpper.includes('US ') || 
      titleUpper.includes('FED') || titleUpper.includes('FOMC') ||
      titleUpper.includes('AMERICAN') || titleUpper.includes('UNITED STATES')) {
    return 'USD';
  }
  
  // GBP related
  if (titleUpper.includes('GBP') || titleUpper.includes('POUND') ||
      titleUpper.includes('BOE') || titleUpper.includes('BRITISH') ||
      titleUpper.includes('UK ') || titleUpper.includes('UNITED KINGDOM')) {
    return 'GBP';
  }
  
  // JPY related
  if (titleUpper.includes('JPY') || titleUpper.includes('YEN') ||
      titleUpper.includes('BOJ') || titleUpper.includes('JAPAN')) {
    return 'JPY';
  }
  
  // AUD related
  if (titleUpper.includes('AUD') || titleUpper.includes('AUSSIE') ||
      titleUpper.includes('RBA') || titleUpper.includes('AUSTRALIA')) {
    return 'AUD';
  }
  
  // NZD related
  if (titleUpper.includes('NZD') || titleUpper.includes('KIWI') ||
      titleUpper.includes('RBNZ') || titleUpper.includes('NEW ZEALAND')) {
    return 'NZD';
  }
  
  // ZAR related
  if (titleUpper.includes('ZAR') || titleUpper.includes('RAND') ||
      titleUpper.includes('SOUTH AFRICA')) {
    return 'ZAR';
  }
  
  return 'OTHER';
}

function checkHighImpactEvents(events) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return events.some(event => {
    if (event.impact !== 'HIGH') return false;
    
    const [eventHour, eventMinute] = event.time.split(':').map(Number);
    const minutesUntilEvent = (eventHour * 60 + eventMinute) - (currentHour * 60 + currentMinute);
    
    // Event is within next 2 hours
    return minutesUntilEvent >= 0 && minutesUntilEvent <= 120;
  });
}

function getCalendarRecommendation(events) {
  const highImpactSoon = checkHighImpactEvents(events);
  
  if (highImpactSoon) {
    return 'AVOID';  // Don't trade before high impact news
  }
  
  const mediumImpactCount = events.filter(e => e.impact === 'MEDIUM').length;
  
  if (mediumImpactCount > 2) {
    return 'CAUTION';  // Trade with caution
  }
  
  return 'PROCEED';  // Safe to trade
}

module.exports = {
  getEconomicCalendar,
  checkHighImpactEvents
};
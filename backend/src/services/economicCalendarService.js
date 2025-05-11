const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

async function getEconomicCalendar() {
  try {
    const events = await fetchEconomicEvents();
    
    return {
      hasHighImpactEvents: checkHighImpactEvents(events),
      events: events,
      tradingRecommendation: getCalendarRecommendation(events)
    };
  } catch (error) {
    console.error('Economic calendar error:', error);
    return {
      hasHighImpactEvents: false,
      events: [],
      tradingRecommendation: 'PROCEED'
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
      })
      .filter(event => event.currency === 'EUR' || event.currency === 'USD');
    
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
      }))
      .filter(event => event.currency === 'EUR' || event.currency === 'USD');
    
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
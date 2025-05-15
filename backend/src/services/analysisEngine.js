const { getMultiTimeframeData } = require('./priceDataService');
const { analyzeMultiTimeframe } = require('./technicalAnalysisService');
const { getMarketNews } = require('./newsAnalysisService');
const { getEconomicCalendar } = require('./economicCalendarService');
const { calculatePosition, validateTarget } = require('./positionCalculator');

async function runAnalysis(currencyPair = 'EUR/USD', timeframe = 'current', accountSettings = null) {
  console.log(`Starting comprehensive analysis for ${currencyPair}...`);
  
  const [baseCurrency, quoteCurrency] = currencyPair.split('/');
  
  try {
    // 1. Get multi-timeframe price data
    console.log(`Fetching ${currencyPair} price data for multiple timeframes...`);
    const multiTimeframeData = await getMultiTimeframeData(baseCurrency, quoteCurrency);
    
    // 2. Perform multi-timeframe technical analysis
    console.log('Calculating technical indicators across timeframes...');
    const technicalAnalysis = analyzeMultiTimeframe(multiTimeframeData);
    
    // 3. Get news analysis for this currency pair
    console.log(`Analyzing news for ${currencyPair}...`);
    const newsAnalysis = await getMarketNews(currencyPair);
    
    // 4. Check economic calendar
    console.log('Checking economic calendar...');
    const economicCalendar = await getEconomicCalendar(currencyPair);
    
    // 5. Make final decision
    const decision = makeDecision(technicalAnalysis, newsAnalysis, economicCalendar);
    
    // 6. Calculate position sizing if account settings provided
    let positionSizing = null;
    let targetValidation = null;
    
    if (accountSettings) {
      // Use 5min data for current price as it's the most recent
      const currentPrice = multiTimeframeData.fiveMin[multiTimeframeData.fiveMin.length - 1].close;
      
      positionSizing = calculatePosition(
        accountSettings.accountBalance,
        accountSettings.targetProfit,
        currentPrice,
        currencyPair,
        decision.direction
      );
      
      targetValidation = validateTarget(
        accountSettings.accountBalance,
        positionSizing.projectedProfit
      );
    }
    
    const analysisResult = {
      timestamp: new Date().toISOString(),
      currencyPair: currencyPair,
      timeframe: timeframe,
      decision: decision.action,
      confidence: decision.confidence,
      direction: decision.direction,
      reasoning: decision.reasoning,
      risks: decision.risks,
      technical: {
        indicators: technicalAnalysis.timeframes.fiveMin.indicators,
        analysis: technicalAnalysis.timeframes.fiveMin,
        multiTimeframe: {
          oneHour: technicalAnalysis.timeframes.oneHour,
          thirtyMin: technicalAnalysis.timeframes.thirtyMin,
          fifteenMin: technicalAnalysis.timeframes.fifteenMin,
          fiveMin: technicalAnalysis.timeframes.fiveMin,
          overallDirection: technicalAnalysis.overallDirection,
          alignmentScore: technicalAnalysis.alignmentScore
        }
      },
      news: newsAnalysis,
      economic: economicCalendar,
      priceData: multiTimeframeData.fiveMin.slice(-20), // Last 20 candles for chart
      positionSizing: positionSizing,
      targetValidation: targetValidation
    };
    
    console.log('Analysis completed');
    return analysisResult;
    
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

function makeDecision(technical, news, economic) {
  let decision = {
    action: 'WAIT',
    direction: null,
    confidence: 0,
    reasoning: [],
    risks: []
  };

  // Check if we should avoid trading
  if (economic.tradingRecommendation === 'AVOID') {
    decision.action = 'WAIT';
    decision.reasoning.push('High impact economic event scheduled');
    decision.risks.push('Economic calendar shows high-risk period');
    return decision;
  }

  // Get overall technical direction and confidence from multi-timeframe analysis
  const technicalDirection = technical.overallDirection;
  const technicalConfidence = technical.confidence;
  
  // Calculate news score
  let newsScore = 0;
  if (news.sentiment === 'BULLISH') newsScore = 1;
  if (news.sentiment === 'BEARISH') newsScore = -1;
  if (news.sentiment === 'NEUTRAL') newsScore = 0;

  // Determine if news aligns with technical
  const newsAligns = (
    (newsScore === 1 && technicalDirection === 'BUY') || 
    (newsScore === -1 && technicalDirection === 'SELL') ||
    (newsScore === 0) // Consider neutral news as non-conflicting
  );
  
  // Potential confidence boost from news alignment
  const newsBoost = newsAligns ? 5 : 0;
  
  // Final confidence calculation
  decision.confidence = Math.min(85, technicalConfidence + newsBoost);

  // Use 80% threshold for trading decisions
  if (technicalDirection === 'BUY' && decision.confidence >= 80) {
    decision.action = 'TRADE';
    decision.direction = 'BUY';
    decision.reasoning.push(`Multi-timeframe analysis shows bullish trend`);
    decision.reasoning.push(`Timeframe alignment score: ${technical.alignmentScore}/5`);
    if (news.sentiment === 'BULLISH') decision.reasoning.push('News sentiment supports buying');
    decision.reasoning.push(`Confidence level: ${decision.confidence}%`);
  } else if (technicalDirection === 'SELL' && decision.confidence >= 80) {
    decision.action = 'TRADE';
    decision.direction = 'SELL';
    decision.reasoning.push(`Multi-timeframe analysis shows bearish trend`);
    decision.reasoning.push(`Timeframe alignment score: ${technical.alignmentScore}/5`);
    if (news.sentiment === 'BEARISH') decision.reasoning.push('News sentiment supports selling');
    decision.reasoning.push(`Confidence level: ${decision.confidence}%`);
  } else {
    decision.action = 'WAIT';
    if (technicalDirection === 'NEUTRAL') {
      decision.reasoning.push('No clear trend direction');
    } else {
      decision.reasoning.push(`Insufficient confidence for ${technicalDirection} signal`);
    }
    
    if (decision.confidence < 80) {
      decision.reasoning.push(`Confidence below 80% threshold (current: ${decision.confidence}%)`);
    }
  }

  // Add risk warnings
  if (economic.tradingRecommendation === 'CAUTION') {
    decision.risks.push('Multiple economic events today - exercise caution');
  }
  
  // Check for timeframe conflicts - updated for new timeframes
  const timeframes = technical.timeframes;
  if (timeframes.oneHour.direction !== timeframes.thirtyMin.direction) {
    decision.risks.push('1-hour and 30-minute timeframes show conflicting signals');
  }
  if (timeframes.thirtyMin.direction !== timeframes.fifteenMin.direction) {
    decision.risks.push('30-minute and 15-minute timeframes show conflicting signals');
  }
  
  // Add risk if news and technical conflict
  if ((technicalDirection === 'BUY' && news.sentiment === 'BEARISH') || 
      (technicalDirection === 'SELL' && news.sentiment === 'BULLISH')) {
    decision.risks.push('Technical and fundamental analysis conflict');
  }
  
  return decision;
}

module.exports = {
  runAnalysis
};
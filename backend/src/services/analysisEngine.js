const { getForexData } = require('./priceDataService');
const { calculateIndicators, analyzeIndicators } = require('./technicalAnalysisService');
const { getMarketNews } = require('./newsAnalysisService');
const { getEconomicCalendar } = require('./economicCalendarService');
const { calculatePosition, validateTarget } = require('./positionCalculator');

async function runAnalysis(timeframe = 'current', accountSettings = null) {
  console.log(`Starting comprehensive analysis for ${timeframe}...`);
  
  try {
    // 1. Get price data
    console.log('Fetching price data...');
    const priceData = await getForexData('EUR', 'USD', '15min');
    
    // 2. Calculate technical indicators
    console.log('Calculating technical indicators...');
    const indicators = calculateIndicators(priceData);
    const technicalAnalysis = analyzeIndicators(indicators);
    
    // 3. Get news analysis
    console.log('Analyzing news...');
    const newsAnalysis = await getMarketNews();
    
    // 4. Check economic calendar
    console.log('Checking economic calendar...');
    const economicCalendar = await getEconomicCalendar();
    
    // 5. Make final decision
    const decision = makeDecision(technicalAnalysis, newsAnalysis, economicCalendar);
    
    // 6. Calculate position sizing if account settings provided
    let positionSizing = null;
    let targetValidation = null;
    
    if (accountSettings) {
      positionSizing = calculatePosition(
        accountSettings.accountBalance,
        accountSettings.monthlyTarget,
        indicators.currentPrice
      );
      
      targetValidation = validateTarget(
        accountSettings.accountBalance,
        accountSettings.monthlyTarget
      );
    }
    
    const analysisResult = {
      timestamp: new Date().toISOString(),
      timeframe: timeframe,
      decision: decision.action,
      confidence: decision.confidence,
      direction: decision.direction,
      reasoning: decision.reasoning,
      risks: decision.risks,
      technical: {
        indicators: indicators,
        analysis: technicalAnalysis
      },
      news: newsAnalysis,
      economic: economicCalendar,
      priceData: priceData.slice(-20), // Last 20 candles for chart
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

  // Weight the signals
  const technicalWeight = 0.6;
  const newsWeight = 0.4;

  // Calculate technical score
  let technicalScore = 0;
  if (technical.direction === 'BUY') technicalScore = 1;
  if (technical.direction === 'SELL') technicalScore = -1;

  // Calculate news score
  let newsScore = 0;
  if (news.sentiment === 'BULLISH') newsScore = 1;
  if (news.sentiment === 'BEARISH') newsScore = -1;

  // Combined score
  const combinedScore = (technicalScore * technicalWeight) + (newsScore * newsWeight);
  
  // Determine confidence
  const alignmentBonus = (technicalScore === newsScore && technicalScore !== 0) ? 15 : 0;
  const baseConfidence = technical.confidence || 50;
  decision.confidence = Math.min(85, baseConfidence + alignmentBonus);

  // Make decision based on combined score
  if (combinedScore > 0.3 && decision.confidence >= 80) {
    decision.action = 'TRADE';
    decision.direction = 'BUY';
    decision.reasoning.push(`Technical indicators bullish (${technical.bullishSignals} vs ${technical.bearishSignals})`);
    if (news.sentiment === 'BULLISH') decision.reasoning.push('News sentiment supports EUR strength');
    decision.reasoning.push(`High confidence level: ${decision.confidence}%`);
  } else if (combinedScore < -0.3 && decision.confidence >= 80) {
    decision.action = 'TRADE';
    decision.direction = 'SELL';
    decision.reasoning.push(`Technical indicators bearish (${technical.bearishSignals} vs ${technical.bullishSignals})`);
    if (news.sentiment === 'BEARISH') decision.reasoning.push('News sentiment supports USD strength');
    decision.reasoning.push(`High confidence level: ${decision.confidence}%`);
  } else {
    decision.action = 'WAIT';
    decision.reasoning.push('Insufficient signal alignment');
    if (Math.abs(combinedScore) < 0.3) decision.reasoning.push('Mixed or weak signals');
    if (decision.confidence < 80) decision.reasoning.push(`Confidence below 80% threshold (current: ${decision.confidence}%)`);
  }

  // Add risk warnings
  if (economic.tradingRecommendation === 'CAUTION') {
    decision.risks.push('Multiple economic events today - exercise caution');
  }
  if (technical.direction === 'NEUTRAL') {
    decision.risks.push('Market in consolidation - false breakouts possible');
  }
  if (Math.abs(technicalScore - newsScore) > 0.5) {
    decision.risks.push('Technical and fundamental analysis conflict');
  }
  
  return decision;
}

module.exports = {
  runAnalysis
};
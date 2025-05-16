const { getMultiTimeframeData } = require('./priceDataService');
const { analyzeMultiTimeframe } = require('./technicalAnalysisService');
const { getMarketNews } = require('./newsAnalysisService');
const { getEconomicCalendar } = require('./economicCalendarService');
const { calculatePosition, validateTarget, determineStandardLotSize } = require('./positionCalculator');

async function runAnalysis(currencyPair = 'EUR/USD', timeframe = 'current', accountSettings = null) {
  console.log(`Starting flag pattern analysis for ${currencyPair}...`);
  
  const [baseCurrency, quoteCurrency] = currencyPair.split('/');
  
  try {
    // 1. Get multi-timeframe price data
    console.log(`Fetching ${currencyPair} price data for 4-hour and 1-hour timeframes...`);
    const multiTimeframeData = await getMultiTimeframeData(baseCurrency, quoteCurrency);
    
    // 2. Perform flag pattern analysis
    console.log('Analyzing flag patterns...');
    const technicalAnalysis = analyzeMultiTimeframe(multiTimeframeData, currencyPair);
    
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
      // Use 1-hour data for current price
      const currentPrice = multiTimeframeData.oneHour[multiTimeframeData.oneHour.length - 1].close;
      
      // If we have a valid flag pattern, use its entry, SL and TP
      if (technicalAnalysis.flagPattern.validTrade) {
        positionSizing = {
          accountBalance: accountSettings.accountBalance,
          targetProfit: accountSettings.targetProfit,
          riskPerTrade: accountSettings.accountBalance * 0.02, // 2% risk
          recommendedLotSize: determineStandardLotSize(accountSettings.accountBalance),
          stopLossPips: technicalAnalysis.flagPattern.stopLossPips,
          takeProfitPips: technicalAnalysis.flagPattern.takeProfitPips,
          maxRiskPercent: 2,
          currencyPair: currencyPair,
          entryPrice: technicalAnalysis.flagPattern.entry,
          stopLossPrice: technicalAnalysis.flagPattern.stopLoss,
          takeProfitPrice: technicalAnalysis.flagPattern.takeProfit,
          direction: technicalAnalysis.flagPattern.direction,
          riskRewardRatio: 3, // Fixed 3:1 ratio
          // Calculate projected profit in currency
          projectedProfit: (accountSettings.accountBalance * 0.02) * 3, // 2% risk * 3 (RR ratio)
          valid: true
        };
      } else {
        // No valid flag pattern, so no position sizing
        positionSizing = null;
      }
      
      targetValidation = {
        isRealistic: true,
        profitPercent: 6, // 2% risk * 3 = 6% reward
        warning: null,
        recommendation: null
      };
    }
    
    // Calculate next check recommendation
    const nextCheckRecommendation = calculateNextCheckTime(technicalAnalysis);
    
    const analysisResult = {
      timestamp: new Date().toISOString(),
      currencyPair: currencyPair,
      timeframe: timeframe,
      decision: decision.action,
      confidence: decision.confidence,
      direction: decision.direction,
      reasoning: decision.reasoning,
      risks: decision.risks,
      nextCheck: nextCheckRecommendation, // Add the next check recommendation here
      technical: {
        flagPattern: technicalAnalysis.flagPattern,
        multiTimeframe: {
          fourHour: { 
            direction: technicalAnalysis.overallDirection,
            priceData: multiTimeframeData.fourHour // Pass the full price data
          },
          oneHour: { 
            direction: technicalAnalysis.overallDirection,
            priceData: multiTimeframeData.oneHour // Pass the full price data
          },
          overallDirection: technicalAnalysis.overallDirection,
          flagPattern: technicalAnalysis.flagPattern
        }
      },
      news: newsAnalysis,
      economic: economicCalendar,
      priceData: multiTimeframeData.oneHour, // Full 1-hour price data
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

function calculateNextCheckTime(technicalAnalysis) {
  // Default check back time (4 hours)
  let hoursToNextCheck = 4;
  const flagPattern = technicalAnalysis.flagPattern;
  
  if (flagPattern.patternDetected) {
    // If a pattern is detected but not valid yet
    if (!flagPattern.validTrade) {
      // If we have a breakout but waiting for pullback
      if (flagPattern.fourHourAnalysis.bullishFlag.breakout?.detected || 
          flagPattern.fourHourAnalysis.bearishFlag.breakout?.detected) {
        // Check more often for pullback
        hoursToNextCheck = 1;
      } 
      // If we have consolidation but waiting for breakout
      else if (flagPattern.fourHourAnalysis.bullishFlag.consolidation?.detected || 
               flagPattern.fourHourAnalysis.bearishFlag.consolidation?.detected) {
        // Check every 2 hours for breakout
        hoursToNextCheck = 2;
      }
    } else {
      // If we have a valid trade, check back in 1 hour to monitor
      hoursToNextCheck = 1;
    }
  } else {
    // No pattern detected, check back in 4 hours
    hoursToNextCheck = 4;
  }
  
  // Calculate next check time
  const now = new Date();
  const nextCheckTime = new Date(now.getTime() + (hoursToNextCheck * 60 * 60 * 1000));
  
  return {
    hoursToNextCheck,
    nextCheckTime: nextCheckTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    nextCheckDate: nextCheckTime.toLocaleDateString(),
    reason: getNextCheckReason(flagPattern, hoursToNextCheck)
  };
}

function getNextCheckReason(flagPattern, hours) {
  if (flagPattern.patternDetected) {
    if (!flagPattern.validTrade) {
      if (flagPattern.fourHourAnalysis.bullishFlag.breakout?.detected || 
          flagPattern.fourHourAnalysis.bearishFlag.breakout?.detected) {
        return "Breakout detected - check back to see if a pullback occurs for entry";
      } else {
        return "Flag pattern forming - check back to monitor for potential breakout";
      }
    } else {
      return "Valid trade setup detected - check back regularly to monitor or for new setups";
    }
  } else {
    return "No flag pattern currently forming - check back later for potential setups";
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

  // Check if we have a valid flag pattern
  const flagPattern = technical.flagPattern;
  
  if (flagPattern.patternDetected && flagPattern.validTrade) {
    // We have a valid flag pattern with 20-pip SL and 60-pip TP
    decision.action = 'TRADE';
    decision.direction = flagPattern.direction;
    decision.confidence = flagPattern.patternQuality;
    
    // Add detailed reasoning about the flag pattern
    decision.reasoning.push(`Flag pattern detected on 4-hour chart with pullback entry on 1-hour chart`);
    decision.reasoning.push(`3-touch trendline rule confirmed`);
    decision.reasoning.push(`Pattern direction: ${flagPattern.direction}`);
    decision.reasoning.push(`Stop loss: ${flagPattern.stopLossPips} pips (within 20-pip limit)`);
    decision.reasoning.push(`Take profit: ${flagPattern.takeProfitPips} pips (60 pips target)`);
    decision.reasoning.push(`Risk-to-reward ratio: 1:3`);
    
    // Add news sentiment if it aligns with pattern
    if ((news.sentiment === 'BULLISH' && flagPattern.direction === 'BUY') || 
        (news.sentiment === 'BEARISH' && flagPattern.direction === 'SELL')) {
      decision.reasoning.push(`News sentiment (${news.sentiment}) supports the pattern direction`);
    }
  } else {
    // No valid flag pattern found
    decision.action = 'WAIT';
    
    if (flagPattern.patternDetected) {
      // Pattern detected but not valid for our risk parameters
      decision.reasoning.push('Flag pattern detected but does not meet 20-pip SL / 60-pip TP criteria');
      if (flagPattern.stopLossPips > 20) {
        decision.reasoning.push(`Required stop loss (${flagPattern.stopLossPips} pips) exceeds maximum 20 pips`);
      }
    } else {
      // No pattern detected
      decision.reasoning.push('No flag pattern with pullback entry detected');
      decision.reasoning.push('Waiting for valid flag pattern formation with 3-touch trendline confirmation');
    }
  }

  // Add risk warnings
  if (economic.tradingRecommendation === 'CAUTION') {
    decision.risks.push('Multiple economic events today - exercise caution');
  }
  
  // Add risk if news and pattern direction conflict
  if (flagPattern.patternDetected && 
      ((flagPattern.direction === 'BUY' && news.sentiment === 'BEARISH') || 
       (flagPattern.direction === 'SELL' && news.sentiment === 'BULLISH'))) {
    decision.risks.push('Pattern direction and news sentiment conflict');
  }
  
  return decision;
}

module.exports = {
  runAnalysis
};
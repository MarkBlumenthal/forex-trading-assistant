const { getPipValue } = require('./priceDataService');

function calculatePosition(accountBalanceGBP, riskPercentage, stopLossPips, currentPrice, currencyPair, direction = null, spreadPips = 0) {
  const [baseCurrency, quoteCurrency] = currencyPair.split('/');
  
  // Calculate risk amount (2% of account)
  const riskPerTradeGBP = accountBalanceGBP * (riskPercentage / 100); // Convert percentage to decimal
  
  // Calculate take profit pips (2:1 ratio)
  const takeProfitPips = stopLossPips * 2;
  
  // Get pip value for this currency pair
  const pipValuePerLot = getPipValue(baseCurrency, quoteCurrency, currentPrice);
  
  // Calculate lot size based on risk and SL distance
  const lotSize = riskPerTradeGBP / (stopLossPips * pipValuePerLot);
  
  // Round lot size to nearest 0.01 (minimum step for most brokers)
  const roundedLotSize = Math.floor(lotSize * 100) / 100;
  
  // Calculate nearest standard lot size based on account balance milestone
  const standardLotSize = determineStandardLotSize(accountBalanceGBP);
  
  // Calculate projected profit based on 2:1 ratio
  const projectedProfit = takeProfitPips * standardLotSize * pipValuePerLot;
  
  // Calculate actual stop loss and take profit prices
  const isJPYPair = quoteCurrency === 'JPY' || baseCurrency === 'JPY';
  const pipSize = isJPYPair ? 0.01 : 0.0001;
  
  // Calculate entry, stop loss and take profit prices
  const entryPrice = currentPrice;
  
  // For BUY trades: SL below entry, TP above entry
  // Account for spread on entry for BUY trades
  const buyEntryWithSpread = entryPrice + (spreadPips * pipSize);
  const buyStopLossPrice = parseFloat((buyEntryWithSpread - (stopLossPips * pipSize)).toFixed(isJPYPair ? 3 : 5));
  const buyTakeProfitPrice = parseFloat((buyEntryWithSpread + (takeProfitPips * pipSize)).toFixed(isJPYPair ? 3 : 5));
  
  // For SELL trades: SL above entry, TP below entry
  // Account for spread on entry for SELL trades
  const sellEntryWithSpread = entryPrice - (spreadPips * pipSize);
  const sellStopLossPrice = parseFloat((sellEntryWithSpread + (stopLossPips * pipSize)).toFixed(isJPYPair ? 3 : 5));
  const sellTakeProfitPrice = parseFloat((sellEntryWithSpread - (takeProfitPips * pipSize)).toFixed(isJPYPair ? 3 : 5));
  
  // Calculate true risk-reward ratio after accounting for spread
  const trueEntryPrice = direction === 'BUY' ? buyEntryWithSpread : sellEntryWithSpread;
  const trueStopLoss = direction === 'BUY' ? buyStopLossPrice : sellStopLossPrice;
  const trueTakeProfit = direction === 'BUY' ? buyTakeProfitPrice : sellTakeProfitPrice;
  
  const trueRiskPips = Math.abs(trueEntryPrice - trueStopLoss) / pipSize;
  const trueRewardPips = Math.abs(trueTakeProfit - trueEntryPrice) / pipSize;
  const trueRiskRewardRatio = trueRewardPips / trueRiskPips;
  
  return {
    accountBalance: accountBalanceGBP,
    riskPercent: riskPercentage,
    riskAmount: riskPerTradeGBP,
    calculatedLotSize: roundedLotSize,
    recommendedLotSize: standardLotSize,
    stopLossPips: stopLossPips,
    takeProfitPips: takeProfitPips,
    spreadPips: spreadPips,
    pipValue: pipValuePerLot,
    currencyPair: currencyPair,
    projectedProfit: projectedProfit,
    riskRewardRatio: 2, // Target ratio
    trueRiskRewardRatio: parseFloat(trueRiskRewardRatio.toFixed(2)), // Actual ratio after spread
    entryPrice: direction === 'BUY' ? buyEntryWithSpread : sellEntryWithSpread,
    stopLossPrice: direction === 'BUY' ? buyStopLossPrice : sellStopLossPrice,
    takeProfitPrice: direction === 'BUY' ? buyTakeProfitPrice : sellTakeProfitPrice,
    direction: direction
  };
}

// Determine standard lot size based on account balance
function determineStandardLotSize(accountBalance) {
  if (accountBalance < 2000) return 0.1;
  if (accountBalance < 3000) return 0.2;
  if (accountBalance < 4000) return 0.3;
  if (accountBalance < 5000) return 0.4;
  if (accountBalance < 6000) return 0.5;
  if (accountBalance < 7000) return 0.6;
  if (accountBalance < 8000) return 0.7;
  if (accountBalance < 9000) return 0.8;
  if (accountBalance < 10000) return 0.9;
  return Math.floor(accountBalance / 10000) * 1.0; // 1.0 lot per £10,000
}

function validateTarget(accountBalance, targetProfit) {
  const profitPercent = (targetProfit / accountBalance) * 100;
  
  return {
    isRealistic: true, // Using 2:1 R:R strategy, so should be realistic
    profitPercent: profitPercent,
    warning: null,
    recommendation: null
  };
}

// Calculate spread based on time of day and currency pair
function calculateSpread(currencyPair, currentTime = new Date()) {
  // Base spreads for different pairs (average values in pips)
  const baseSpreadPips = {
    'EUR/USD': 1.0,
    'USD/JPY': 1.2,
    'GBP/USD': 1.8,
    'AUD/USD': 1.5,
    'NZD/USD': 1.9,
    'EUR/GBP': 1.7,
    'USD/CHF': 1.6,
    'EUR/JPY': 2.0,
    'USD/CAD': 1.8,
    'GBP/JPY': 2.5,
    'default': 2.0 // Default for other pairs
  };
  
  // Get the hour (0-23) in broker time (assuming broker uses GMT+3)
  const hourGMT3 = (currentTime.getUTCHours() + 3) % 24;
  
  // Time multipliers (higher during less liquid periods)
  let timeMultiplier = 1.0; // Default
  
  // Asian session (low liquidity for most pairs) - 22:00-07:00 GMT+3
  if (hourGMT3 >= 22 || hourGMT3 < 7) {
    timeMultiplier = 1.5; // 50% higher spreads
  }
  // End of NY session and before Asian session - 19:00-22:00 GMT+3
  else if (hourGMT3 >= 19 && hourGMT3 < 22) {
    timeMultiplier = 1.3; // 30% higher spreads
  }
  // European/London/NY overlap - 13:00-16:00 GMT+3
  else if (hourGMT3 >= 13 && hourGMT3 < 16) {
    timeMultiplier = 0.8; // 20% lower spreads (high liquidity)
  }
  
  // Get base spread
  const baseSpread = baseSpreadPips[currencyPair] || baseSpreadPips.default;
  
  // Calculate adjusted spread
  const adjustedSpread = baseSpread * timeMultiplier;
  
  return Math.round(adjustedSpread * 10) / 10; // Round to 1 decimal place
}

module.exports = {
  calculatePosition,
  validateTarget,
  determineStandardLotSize,
  calculateSpread
};
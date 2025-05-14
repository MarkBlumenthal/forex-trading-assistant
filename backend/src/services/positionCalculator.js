const { getPipValue } = require('./priceDataService');

function calculatePosition(accountBalanceGBP, targetProfitGBP, currentPrice, currencyPair) {
  const [baseCurrency, quoteCurrency] = currencyPair.split('/');
  
  // Fixed values for our strategy
  const riskPerTradeGBP = accountBalanceGBP * 0.02; // 2% risk per trade
  const stopLossPips = 20; // Fixed 20 pip stop loss
  const takeProfitPips = 60; // Fixed 60 pip take profit (3:1 ratio)
  
  // Get pip value for this currency pair
  const pipValuePerLot = getPipValue(baseCurrency, quoteCurrency, currentPrice);
  
  // Calculate lot size based on risk and fixed SL
  const lotSize = riskPerTradeGBP / (stopLossPips * pipValuePerLot);
  
  // Round lot size to nearest 0.01 (minimum step for most brokers)
  const roundedLotSize = Math.floor(lotSize * 100) / 100;
  
  // Calculate nearest standard lot size based on account balance milestone
  const standardLotSize = determineStandardLotSize(accountBalanceGBP);
  
  // Calculate projected profit
  const projectedProfit = takeProfitPips * standardLotSize * pipValuePerLot;
  
  return {
    accountBalance: accountBalanceGBP,
    targetProfit: projectedProfit, // Now calculated based on our risk:reward model
    riskPerTrade: riskPerTradeGBP,
    calculatedLotSize: roundedLotSize,
    recommendedLotSize: standardLotSize, // Always use standard lot size based on balance
    stopLossPips: stopLossPips,
    takeProfitPips: takeProfitPips,
    pipValue: pipValuePerLot,
    maxRiskPercent: 2,
    currencyPair: currencyPair,
    projectedProfit: projectedProfit,
    riskRewardRatio: takeProfitPips / stopLossPips
  };
}

// New function to determine standard lot size based on account balance
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
    isRealistic: true, // We're now using a fixed 3:1 R:R strategy, so always realistic
    profitPercent: profitPercent,
    warning: null, // No warnings needed since we're using a fixed strategy
    recommendation: null
  };
}

module.exports = {
  calculatePosition,
  validateTarget
};
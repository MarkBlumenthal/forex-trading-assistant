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
  
  // Calculate actual stop loss and take profit prices
  const isJPYPair = quoteCurrency === 'JPY' || baseCurrency === 'JPY';
  const pipSize = isJPYPair ? 0.01 : 0.0001;
  
  // Calculate entry, stop loss and take profit prices
  const entryPrice = currentPrice;
  
  // For BUY trades: SL below entry, TP above entry
  const buyStopLossPrice = parseFloat((entryPrice - (stopLossPips * pipSize)).toFixed(isJPYPair ? 3 : 5));
  const buyTakeProfitPrice = parseFloat((entryPrice + (takeProfitPips * pipSize)).toFixed(isJPYPair ? 3 : 5));
  
  // For SELL trades: SL above entry, TP below entry
  const sellStopLossPrice = parseFloat((entryPrice + (stopLossPips * pipSize)).toFixed(isJPYPair ? 3 : 5));
  const sellTakeProfitPrice = parseFloat((entryPrice - (takeProfitPips * pipSize)).toFixed(isJPYPair ? 3 : 5));
  
  return {
    accountBalance: accountBalanceGBP,
    targetProfit: projectedProfit,
    riskPerTrade: riskPerTradeGBP,
    calculatedLotSize: roundedLotSize,
    recommendedLotSize: standardLotSize,
    stopLossPips: stopLossPips,
    takeProfitPips: takeProfitPips,
    pipValue: pipValuePerLot,
    maxRiskPercent: 2,
    currencyPair: currencyPair,
    projectedProfit: projectedProfit,
    riskRewardRatio: takeProfitPips / stopLossPips,
    entryPrice: entryPrice,
    buySetup: {
      entry: entryPrice,
      stopLoss: buyStopLossPrice,
      takeProfit: buyTakeProfitPrice
    },
    sellSetup: {
      entry: entryPrice,
      stopLoss: sellStopLossPrice,
      takeProfit: sellTakeProfitPrice
    }
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
    isRealistic: true, // We're using a fixed 3:1 R:R strategy, so always realistic
    profitPercent: profitPercent,
    warning: null,
    recommendation: null
  };
}

module.exports = {
  calculatePosition,
  validateTarget
};
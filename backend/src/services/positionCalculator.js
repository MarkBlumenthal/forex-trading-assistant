const { getPipValue } = require('./priceDataService');

function calculatePosition(accountBalanceGBP, targetProfitGBP, currentPrice, currencyPair) {
  const [baseCurrency, quoteCurrency] = currencyPair.split('/');
  const riskPerTradeGBP = accountBalanceGBP * 0.02; // 2% risk per trade
  
  // Get pip value for this currency pair
  const pipValuePerLot = getPipValue(baseCurrency, quoteCurrency, currentPrice);
  
  // Calculate position size based on risk
  const stopLossPips = 10; // Conservative 10 pip stop loss
  const lotSize = riskPerTradeGBP / (stopLossPips * pipValuePerLot);
  
  // Calculate required pips for target profit (£50)
  const requiredPips = Math.ceil(targetProfitGBP / (lotSize * pipValuePerLot));
  
  return {
    accountBalance: accountBalanceGBP,
    targetProfit: targetProfitGBP,
    riskPerTrade: riskPerTradeGBP,
    recommendedLotSize: Math.round(lotSize * 100) / 100,
    stopLossPips: stopLossPips,
    takeProfitPips: requiredPips,
    requiredPips: requiredPips,
    pipValue: pipValuePerLot,
    maxRiskPercent: 2,
    currencyPair: currencyPair,
    projectedProfit: requiredPips * lotSize * pipValuePerLot,
    riskRewardRatio: requiredPips / stopLossPips
  };
}

function validateTarget(accountBalance, targetProfit) {
  const profitPercent = (targetProfit / accountBalance) * 100;
  
  return {
    isRealistic: profitPercent <= 10, // £50 on £1000 = 5%, which is realistic
    profitPercent: profitPercent,
    warning: profitPercent > 10 ? 
      `Warning: ${profitPercent.toFixed(1)}% profit per trade is high risk` : null,
    recommendation: profitPercent > 10 ?
      `Recommended target: £${(accountBalance * 0.05).toFixed(2)} (5% per trade)` : null
  };
}

module.exports = {
  calculatePosition,
  validateTarget
};
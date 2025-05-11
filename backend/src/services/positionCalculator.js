function calculatePosition(accountBalanceGBP, monthlyTargetGBP, currentPrice) {
  const tradingDaysPerMonth = 20;
  const dailyTargetGBP = monthlyTargetGBP / tradingDaysPerMonth;
  const riskPerTradeGBP = accountBalanceGBP * 0.02; // 2% risk per trade
  
  // Calculate position size based on risk
  const stopLossPips = 10; // Conservative 10 pip stop loss
  const pipValuePerLot = calculatePipValue(currentPrice);
  const lotSize = riskPerTradeGBP / (stopLossPips * pipValuePerLot);
  
  // Calculate required pips for daily target
  const requiredPips = Math.ceil(dailyTargetGBP / (lotSize * pipValuePerLot));
  
  return {
    accountBalance: accountBalanceGBP,
    monthlyTarget: monthlyTargetGBP,
    dailyTarget: dailyTargetGBP,
    riskPerTrade: riskPerTradeGBP,
    recommendedLotSize: Math.round(lotSize * 100) / 100,
    stopLossPips: stopLossPips,
    takeProfitPips: requiredPips,
    requiredPips: requiredPips,
    pipValue: pipValuePerLot,
    maxRiskPercent: 2
  };
}

function calculatePipValue(currentPrice) {
  // For EUR/USD, 1 pip = $10 per standard lot
  // Convert to GBP (approximate rate)
  const usdToGbp = 0.78;
  return 10 * usdToGbp;
}

function validateTarget(accountBalance, monthlyTarget) {
  const monthlyReturnPercent = (monthlyTarget / accountBalance) * 100;
  
  return {
    isRealistic: monthlyReturnPercent <= 20,
    monthlyReturnPercent: monthlyReturnPercent,
    warning: monthlyReturnPercent > 20 ? 
      `Warning: ${monthlyReturnPercent.toFixed(1)}% monthly return is extremely high risk` : null,
    recommendation: monthlyReturnPercent > 20 ?
      `Recommended target: £${(accountBalance * 0.1).toFixed(2)} (10% monthly)` : null
  };
}

module.exports = {
  calculatePosition,
  validateTarget
};
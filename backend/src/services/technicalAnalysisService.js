const { 
  RSI, 
  MACD, 
  BollingerBands, 
  SMA, 
  EMA,
  ATR,
  Stochastic,
  ADX,
  CCI,
  WilliamsR,
  PSAR,
  IchimokuCloud,
  MFI,
  OBV
} = require('technicalindicators');

function calculateIndicators(priceData) {
  const closes = priceData.map(d => d.close);
  const highs = priceData.map(d => d.high);
  const lows = priceData.map(d => d.low);
  const volumes = priceData.map(d => d.volume || 1000); // Default volume if not available

  // RSI
  const rsiValues = RSI.calculate({
    values: closes,
    period: 14
  });

  // MACD
  const macdValues = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  // Bollinger Bands
  const bbValues = BollingerBands.calculate({
    period: 20,
    values: closes,
    stdDev: 2
  });

  // Moving Averages
  const sma20 = SMA.calculate({ period: 20, values: closes });
  const sma50 = SMA.calculate({ period: 50, values: closes });
  const sma200 = SMA.calculate({ period: 200, values: closes });
  const ema9 = EMA.calculate({ period: 9, values: closes });
  const ema21 = EMA.calculate({ period: 21, values: closes });

  // ATR for volatility
  const atr = ATR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14
  });

  // Stochastic
  const stochastic = Stochastic.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14,
    signalPeriod: 3
  });

  // ADX (Average Directional Index)
  const adx = ADX.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14
  });

  // CCI (Commodity Channel Index)
  const cci = CCI.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 20
  });

  // Williams %R
  const williamsR = WilliamsR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14
  });

  // Parabolic SAR
  const psar = PSAR.calculate({
    high: highs,
    low: lows,
    step: 0.02,
    max: 0.2
  });

  // Money Flow Index
  const mfi = MFI.calculate({
    high: highs,
    low: lows,
    close: closes,
    volume: volumes,
    period: 14
  });

  // On Balance Volume
  const obv = OBV.calculate({
    close: closes,
    volume: volumes
  });

  // Get latest values
  const latestRSI = rsiValues[rsiValues.length - 1];
  const latestMACD = macdValues[macdValues.length - 1];
  const latestBB = bbValues[bbValues.length - 1];
  const latestClose = closes[closes.length - 1];
  const latestSMA20 = sma20[sma20.length - 1];
  const latestSMA50 = sma50[sma50.length - 1];
  const latestSMA200 = sma200[sma200.length - 1];
  const latestATR = atr[atr.length - 1];
  const latestStoch = stochastic[stochastic.length - 1];
  const latestADX = adx[adx.length - 1];
  const latestCCI = cci[cci.length - 1];
  const latestWilliamsR = williamsR[williamsR.length - 1];
  const latestPSAR = psar[psar.length - 1];
  const latestMFI = mfi[mfi.length - 1];
  const latestOBV = obv[obv.length - 1];

  return {
    rsi: latestRSI,
    macd: latestMACD,
    bollingerBands: latestBB,
    sma20: latestSMA20,
    sma50: latestSMA50,
    sma200: latestSMA200,
    ema9: ema9[ema9.length - 1],
    ema21: ema21[ema21.length - 1],
    atr: latestATR,
    stochastic: latestStoch,
    adx: latestADX,
    cci: latestCCI,
    williamsR: latestWilliamsR,
    psar: latestPSAR,
    mfi: latestMFI,
    obv: latestOBV,
    currentPrice: latestClose,
    trend: determineTrend(closes, sma20, sma50, sma200)
  };
}

function determineTrend(closes, sma20, sma50, sma200) {
  const currentPrice = closes[closes.length - 1];
  const currentSMA20 = sma20[sma20.length - 1];
  const currentSMA50 = sma50[sma50.length - 1];
  const currentSMA200 = sma200[sma200.length - 1];

  if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50 && currentSMA50 > currentSMA200) {
    return 'STRONG_UPTREND';
  } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50 && currentSMA50 < currentSMA200) {
    return 'STRONG_DOWNTREND';
  } else if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
    return 'UPTREND';
  } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
    return 'DOWNTREND';
  } else {
    return 'SIDEWAYS';
  }
}

function analyzeIndicators(indicators) {
  let bullishSignals = 0;
  let bearishSignals = 0;
  const signals = [];

  // RSI Analysis
  if (indicators.rsi < 30) {
    bullishSignals++;
    signals.push('RSI oversold (bullish)');
  } else if (indicators.rsi > 70) {
    bearishSignals++;
    signals.push('RSI overbought (bearish)');
  }

  // MACD Analysis
  if (indicators.macd && indicators.macd.MACD > indicators.macd.signal) {
    bullishSignals++;
    signals.push('MACD bullish crossover');
  } else if (indicators.macd && indicators.macd.MACD < indicators.macd.signal) {
    bearishSignals++;
    signals.push('MACD bearish crossover');
  }

  // Bollinger Bands Analysis
  if (indicators.bollingerBands) {
    if (indicators.currentPrice < indicators.bollingerBands.lower) {
      bullishSignals++;
      signals.push('Price below lower Bollinger Band (oversold)');
    } else if (indicators.currentPrice > indicators.bollingerBands.upper) {
      bearishSignals++;
      signals.push('Price above upper Bollinger Band (overbought)');
    }
  }

  // Trend Analysis
  if (indicators.trend === 'STRONG_UPTREND' || indicators.trend === 'UPTREND') {
    bullishSignals++;
    signals.push(`Price in ${indicators.trend}`);
  } else if (indicators.trend === 'STRONG_DOWNTREND' || indicators.trend === 'DOWNTREND') {
    bearishSignals++;
    signals.push(`Price in ${indicators.trend}`);
  }

  // Stochastic Analysis
  if (indicators.stochastic) {
    if (indicators.stochastic.k < 20) {
      bullishSignals++;
      signals.push('Stochastic oversold');
    } else if (indicators.stochastic.k > 80) {
      bearishSignals++;
      signals.push('Stochastic overbought');
    }
  }

  // ADX Analysis
  if (indicators.adx && indicators.adx.adx > 25) {
    signals.push(`Strong trend (ADX: ${indicators.adx.adx.toFixed(2)})`);
  }

  // CCI Analysis
  if (indicators.cci < -100) {
    bullishSignals++;
    signals.push('CCI oversold');
  } else if (indicators.cci > 100) {
    bearishSignals++;
    signals.push('CCI overbought');
  }

  // Williams %R Analysis
  if (indicators.williamsR < -80) {
    bullishSignals++;
    signals.push('Williams %R oversold');
  } else if (indicators.williamsR > -20) {
    bearishSignals++;
    signals.push('Williams %R overbought');
  }

  // MFI Analysis
  if (indicators.mfi < 20) {
    bullishSignals++;
    signals.push('MFI oversold');
  } else if (indicators.mfi > 80) {
    bearishSignals++;
    signals.push('MFI overbought');
  }

  // Parabolic SAR
  if (indicators.psar && indicators.currentPrice > indicators.psar) {
    bullishSignals++;
    signals.push('Price above Parabolic SAR (bullish)');
  } else if (indicators.psar && indicators.currentPrice < indicators.psar) {
    bearishSignals++;
    signals.push('Price below Parabolic SAR (bearish)');
  }

  const totalSignals = bullishSignals + bearishSignals;
  const bullishPercentage = totalSignals > 0 ? (bullishSignals / totalSignals) * 100 : 50;

  return {
    direction: bullishPercentage > 60 ? 'BUY' : bullishPercentage < 40 ? 'SELL' : 'NEUTRAL',
    bullishSignals,
    bearishSignals,
    confidence: Math.abs(bullishPercentage - 50),
    signals
  };
}

function analyzeMultiTimeframe(multiTimeframeData) {
  // Analyze each timeframe with new timeframes
  const oneHourAnalysis = analyzeTimeframe(multiTimeframeData.oneHour);
  const thirtyMinAnalysis = analyzeTimeframe(multiTimeframeData.thirtyMin);
  const fifteenMinAnalysis = analyzeTimeframe(multiTimeframeData.fifteenMin);
  const fiveMinAnalysis = analyzeTimeframe(multiTimeframeData.fiveMin);
  
  // Calculate overall direction based on weighted timeframe signals
  const directions = {
    oneHour: oneHourAnalysis.direction === 'BUY' ? 1 : oneHourAnalysis.direction === 'SELL' ? -1 : 0,
    thirtyMin: thirtyMinAnalysis.direction === 'BUY' ? 1 : thirtyMinAnalysis.direction === 'SELL' ? -1 : 0,
    fifteenMin: fifteenMinAnalysis.direction === 'BUY' ? 1 : fifteenMinAnalysis.direction === 'SELL' ? -1 : 0,
    fiveMin: fiveMinAnalysis.direction === 'BUY' ? 1 : fiveMinAnalysis.direction === 'SELL' ? -1 : 0
  };
  
  // Adjust weights for the new timeframes
  const weightedSum = 
    (directions.oneHour * 4) +      // Highest weight for the 1-hour timeframe
    (directions.thirtyMin * 3) +    // High weight for 30-min
    (directions.fifteenMin * 2) +   // Medium weight for 15-min
    (directions.fiveMin * 1);       // Lowest weight for 5-min
  
  // Keep threshold at >3 for conservative signals
  let overallDirection = 'NEUTRAL';
  if (weightedSum > 3) overallDirection = 'BUY';      
  else if (weightedSum < -3) overallDirection = 'SELL'; 
  
  // Calculate alignment score (how well timeframes align)
  let alignmentScore = 0;
  if (directions.oneHour === directions.thirtyMin && directions.oneHour !== 0) alignmentScore += 2;
  if (directions.thirtyMin === directions.fifteenMin && directions.thirtyMin !== 0) alignmentScore += 2;
  if (directions.fifteenMin === directions.fiveMin && directions.fifteenMin !== 0) alignmentScore += 1;
  
  // Calculate confidence based on alignment and signal strength
  const confidence = Math.min(
    85, // Cap at 85%
    45 + // Base confidence
    (alignmentScore * 5) + // Add for alignment (max 25%)
    (Math.abs(weightedSum) * 2.5) // Add for signal strength
  );
  
  return {
    overallDirection,
    confidence,
    alignmentScore,
    weightedSum,
    timeframes: {
      oneHour: oneHourAnalysis,
      thirtyMin: thirtyMinAnalysis,
      fifteenMin: fifteenMinAnalysis,
      fiveMin: fiveMinAnalysis
    }
  };
}

// Helper function to analyze a single timeframe
function analyzeTimeframe(priceData) {
  const indicators = calculateIndicators(priceData);
  const analysis = analyzeIndicators(indicators);
  
  return {
    ...analysis,
    indicators
  };
}

module.exports = {
  calculateIndicators,
  analyzeIndicators,
  analyzeMultiTimeframe
};
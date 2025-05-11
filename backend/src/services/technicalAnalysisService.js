const { 
    RSI, 
    MACD, 
    BollingerBands, 
    SMA, 
    EMA,
    ATR,
    Stochastic
  } = require('technicalindicators');
  
  function calculateIndicators(priceData) {
    const closes = priceData.map(d => d.close);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
  
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
    const ema9 = EMA.calculate({ period: 9, values: closes });
  
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
  
    // Get latest values
    const latestRSI = rsiValues[rsiValues.length - 1];
    const latestMACD = macdValues[macdValues.length - 1];
    const latestBB = bbValues[bbValues.length - 1];
    const latestClose = closes[closes.length - 1];
    const latestSMA20 = sma20[sma20.length - 1];
    const latestSMA50 = sma50[sma50.length - 1];
    const latestATR = atr[atr.length - 1];
    const latestStoch = stochastic[stochastic.length - 1];
  
    return {
      rsi: latestRSI,
      macd: latestMACD,
      bollingerBands: latestBB,
      sma20: latestSMA20,
      sma50: latestSMA50,
      ema9: ema9[ema9.length - 1],
      atr: latestATR,
      stochastic: latestStoch,
      currentPrice: latestClose,
      trend: determineTrend(closes, sma20, sma50)
    };
  }
  
  function determineTrend(closes, sma20, sma50) {
    const currentPrice = closes[closes.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
  
    if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
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
    if (indicators.trend === 'UPTREND') {
      bullishSignals++;
      signals.push('Price in uptrend');
    } else if (indicators.trend === 'DOWNTREND') {
      bearishSignals++;
      signals.push('Price in downtrend');
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
  
  module.exports = {
    calculateIndicators,
    analyzeIndicators
  };
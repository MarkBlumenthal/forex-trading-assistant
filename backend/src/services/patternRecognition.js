// Flag pattern detection functions

// Check for bullish flag (uptrend with consolidation pullback)
function detectBullishFlag(priceData, lookbackPeriod = 30) {
  if (priceData.length < lookbackPeriod) return { detected: false };
  
  // Get relevant section of price data
  const data = priceData.slice(-lookbackPeriod);
  
  // 1. Identify the flag pole (strong upward move)
  const potentialPoles = findBullishPoles(data);
  if (potentialPoles.length === 0) return { detected: false };
  
  // Use the most recent pole
  const pole = potentialPoles[potentialPoles.length - 1];
  
  // 2. Look for consolidation/pullback after the pole
  const consolidation = findBullishConsolidation(data, pole.endIndex);
  if (!consolidation.detected) return { detected: false };
  
  // 3. Verify the trendline with at least 3 touches
  const trendlineValidation = validateBullishTrendline(data, consolidation);
  if (!trendlineValidation.valid) return { detected: false };
  
  // 4. Check for breakout
  const breakout = checkBullishBreakout(data, consolidation, trendlineValidation);
  if (!breakout.detected) return { detected: false };
  
  // 5. Check for pullback to the breakout level
  const pullback = checkBullishPullback(data, breakout);
  
  // Calculate entry, stop loss, and take profit if pattern is complete
  let entry = null;
  let stopLoss = null;
  let takeProfit = null;
  
  if (pullback.detected) {
    // Entry is at the pullback level
    entry = pullback.level;
    
    // Stop loss is below the lowest point of the consolidation
    stopLoss = consolidation.lowestLow;
    
    // Take profit is entry + (entry - stopLoss) * 2 (2:1 reward-to-risk ratio)
    takeProfit = entry + (entry - stopLoss) * 2;
  }
  
  // Calculate pip distances
  const isJPYPair = false; // This should be determined based on the currency pair
  const pipSize = isJPYPair ? 0.01 : 0.0001;
  
  let stopLossPips = null;
  let takeProfitPips = null;
  
  if (entry && stopLoss) {
    stopLossPips = Math.abs(entry - stopLoss) / pipSize;
    takeProfitPips = Math.abs(takeProfit - entry) / pipSize;
  }
  
  return {
    detected: breakout.detected,
    direction: 'BUY',
    pole,
    consolidation,
    trendlineValidation,
    breakout,
    pullback,
    entry,
    stopLoss,
    takeProfit,
    stopLossPips,
    takeProfitPips,
    valid: entry && stopLoss && pullback.detected // Only require entry, stop loss and pullback - no pip limits
  };
}

// Check for bearish flag (downtrend with consolidation pullback)
function detectBearishFlag(priceData, lookbackPeriod = 30) {
  if (priceData.length < lookbackPeriod) return { detected: false };
  
  // Get relevant section of price data
  const data = priceData.slice(-lookbackPeriod);
  
  // 1. Identify the flag pole (strong downward move)
  const potentialPoles = findBearishPoles(data);
  if (potentialPoles.length === 0) return { detected: false };
  
  // Use the most recent pole
  const pole = potentialPoles[potentialPoles.length - 1];
  
  // 2. Look for consolidation/pullback after the pole
  const consolidation = findBearishConsolidation(data, pole.endIndex);
  if (!consolidation.detected) return { detected: false };
  
  // 3. Verify the trendline with at least 3 touches
  const trendlineValidation = validateBearishTrendline(data, consolidation);
  if (!trendlineValidation.valid) return { detected: false };
  
  // 4. Check for breakout
  const breakout = checkBearishBreakout(data, consolidation, trendlineValidation);
  if (!breakout.detected) return { detected: false };
  
  // 5. Check for pullback to the breakout level
  const pullback = checkBearishPullback(data, breakout);
  
  // Calculate entry, stop loss, and take profit if pattern is complete
  let entry = null;
  let stopLoss = null;
  let takeProfit = null;
  
  if (pullback.detected) {
    // Entry is at the pullback level
    entry = pullback.level;
    
    // Stop loss is above the highest point of the consolidation
    stopLoss = consolidation.highestHigh;
    
    // Take profit is entry - (stopLoss - entry) * 2 (2:1 reward-to-risk ratio)
    takeProfit = entry - (stopLoss - entry) * 2;
  }
  
  // Calculate pip distances
  const isJPYPair = false; // This should be determined based on the currency pair
  const pipSize = isJPYPair ? 0.01 : 0.0001;
  
  let stopLossPips = null;
  let takeProfitPips = null;
  
  if (entry && stopLoss) {
    stopLossPips = Math.abs(entry - stopLoss) / pipSize;
    takeProfitPips = Math.abs(takeProfit - entry) / pipSize;
  }
  
  return {
    detected: breakout.detected,
    direction: 'SELL',
    pole,
    consolidation,
    trendlineValidation,
    breakout,
    pullback,
    entry,
    stopLoss,
    takeProfit,
    stopLossPips,
    takeProfitPips,
    valid: entry && stopLoss && pullback.detected // Only require entry, stop loss and pullback - no pip limits
  };
}

// Helper function to find bullish poles (strong upward moves)
function findBullishPoles(data) {
  const poles = [];
  
  for (let i = 5; i < data.length - 5; i++) {
    // Look for strong bullish moves (can be multiple candles)
    let startIdx = i;
    let endIdx = i;
    
    // Find local low
    while (startIdx > 0 && data[startIdx-1].low > data[startIdx].low) {
      startIdx--;
    }
    
    // Find local high after the low
    while (endIdx < data.length - 1 && data[endIdx+1].high > data[endIdx].high) {
      endIdx++;
    }
    
    // Ensure there's enough movement (at least 3 candles)
    if (endIdx - startIdx >= 2) {
      const startPrice = data[startIdx].low;
      const endPrice = data[endIdx].high;
      const poleSize = endPrice - startPrice;
      
      // Ensure the move is significant (at least 0.5%)
      if (poleSize / startPrice > 0.005) {
        poles.push({
          startIndex: startIdx,
          endIndex: endIdx,
          startPrice,
          endPrice,
          poleSize
        });
        
        // Skip to end of this pole
        i = endIdx;
      }
    }
  }
  
  return poles;
}

// Helper function to find bearish poles (strong downward moves)
function findBearishPoles(data) {
  const poles = [];
  
  for (let i = 5; i < data.length - 5; i++) {
    // Look for strong bearish moves (can be multiple candles)
    let startIdx = i;
    let endIdx = i;
    
    // Find local high
    while (startIdx > 0 && data[startIdx-1].high < data[startIdx].high) {
      startIdx--;
    }
    
    // Find local low after the high
    while (endIdx < data.length - 1 && data[endIdx+1].low < data[endIdx].low) {
      endIdx++;
    }
    
    // Ensure there's enough movement (at least 3 candles)
    if (endIdx - startIdx >= 2) {
      const startPrice = data[startIdx].high;
      const endPrice = data[endIdx].low;
      const poleSize = startPrice - endPrice;
      
      // Ensure the move is significant (at least 0.5%)
      if (poleSize / startPrice > 0.005) {
        poles.push({
          startIndex: startIdx,
          endIndex: endIdx,
          startPrice,
          endPrice,
          poleSize
        });
        
        // Skip to end of this pole
        i = endIdx;
      }
    }
  }
  
  return poles;
}

// Helper function to find bullish consolidation/pullback
function findBullishConsolidation(data, poleEndIndex) {
  if (poleEndIndex >= data.length - 3) return { detected: false };
  
  // Look for a range-bound period after the pole
  const consolidationStart = poleEndIndex + 1;
  let consolidationEnd = consolidationStart;
  
  // Find the end of consolidation (at least 3 candles)
  for (let i = consolidationStart + 2; i < data.length; i++) {
    consolidationEnd = i;
    
    // Check if the trend has resumed (breakout)
    if (data[i].close > data[poleEndIndex].high) {
      break;
    }
  }
  
  // Ensure consolidation is at least 3 candles
  if (consolidationEnd - consolidationStart < 2) return { detected: false };
  
  // Calculate the consolidation range
  const consolidationCandles = data.slice(consolidationStart, consolidationEnd + 1);
  const highestHigh = Math.max(...consolidationCandles.map(c => c.high));
  const lowestLow = Math.min(...consolidationCandles.map(c => c.low));
  const range = highestHigh - lowestLow;
  
  // Ensure the consolidation is a pullback (retracement of the pole)
  const poleHigh = data[poleEndIndex].high;
  const pullbackAmount = (poleHigh - lowestLow) / poleHigh;
  
  return {
    detected: pullbackAmount > 0.001 && pullbackAmount < 0.7, // Ensure there is some pullback but not too extreme
    consolidationStart,
    consolidationEnd,
    highestHigh,
    lowestLow,
    range,
    candles: consolidationCandles
  };
}

// Helper function to find bearish consolidation/pullback
function findBearishConsolidation(data, poleEndIndex) {
  if (poleEndIndex >= data.length - 3) return { detected: false };
  
  // Look for a range-bound period after the pole
  const consolidationStart = poleEndIndex + 1;
  let consolidationEnd = consolidationStart;
  
  // Find the end of consolidation (at least 3 candles)
  for (let i = consolidationStart + 2; i < data.length; i++) {
    consolidationEnd = i;
    
    // Check if the trend has resumed (breakout)
    if (data[i].close < data[poleEndIndex].low) {
      break;
    }
  }
  
  // Ensure consolidation is at least 3 candles
  if (consolidationEnd - consolidationStart < 2) return { detected: false };
  
  // Calculate the consolidation range
  const consolidationCandles = data.slice(consolidationStart, consolidationEnd + 1);
  const highestHigh = Math.max(...consolidationCandles.map(c => c.high));
  const lowestLow = Math.min(...consolidationCandles.map(c => c.low));
  const range = highestHigh - lowestLow;
  
  // Ensure the consolidation is a pullback (retracement of the pole)
  const poleLow = data[poleEndIndex].low;
  const pullbackAmount = (highestHigh - poleLow) / poleLow;
  
  return {
    detected: pullbackAmount > 0.001 && pullbackAmount < 0.7, // Ensure there is some pullback but not too extreme
    consolidationStart,
    consolidationEnd,
    highestHigh,
    lowestLow,
    range,
    candles: consolidationCandles
  };
}

// Helper function to validate bullish trendline (requires at least 3 touches)
function validateBullishTrendline(data, consolidation) {
  if (!consolidation.detected) return { valid: false };
  
  const { consolidationStart, consolidationEnd, candles } = consolidation;
  
  if (!candles || candles.length < 3) return { valid: false };
  
  // For a bullish flag, we look for a downward sloping resistance line
  // that has at least 3 touches (highs touching the line)
  
  // Find the initial two highest points to draw the line
  let sortedByHigh = [...candles].sort((a, b) => b.high - a.high);
  
  if (sortedByHigh.length < 3) return { valid: false };
  
  // Get indices of two highest points in original array
  const highPoint1 = candles.findIndex(c => c.high === sortedByHigh[0].high);
  let highPoint2 = -1;
  
  // Find the second high point that's not adjacent to the first
  for (let i = 0; i < sortedByHigh.length; i++) {
    const idx = candles.findIndex(c => c.high === sortedByHigh[i].high);
    if (idx !== highPoint1 && Math.abs(idx - highPoint1) > 1) {
      highPoint2 = idx;
      break;
    }
  }
  
  if (highPoint2 === -1) return { valid: false };
  
  // Calculate trendline slope and intercept
  const x1 = highPoint1;
  const y1 = candles[highPoint1].high;
  const x2 = highPoint2;
  const y2 = candles[highPoint2].high;
  
  const slope = (y2 - y1) / (x2 - x1);
  const intercept = y1 - (slope * x1);
  
  // Function to get y-value on the trendline at a given x
  const getTrendlineValue = (x) => (slope * x) + intercept;
  
  // Count touches (candles where high is close to the trendline)
  let touchCount = 0;
  let touches = [];
  
  for (let i = 0; i < candles.length; i++) {
    const trendlineValue = getTrendlineValue(i);
    const highValue = candles[i].high;
    const threshold = Math.abs(trendlineValue * 0.0005); // Small percentage tolerance
    
    if (Math.abs(highValue - trendlineValue) <= threshold) {
      touchCount++;
      touches.push(i);
    }
  }
  
  return {
    valid: touchCount >= 3, // Require at least 3 touches
    slope,
    intercept,
    touches,
    touchCount
  };
}

// Helper function to validate bearish trendline (requires at least 3 touches)
function validateBearishTrendline(data, consolidation) {
  if (!consolidation.detected) return { valid: false };
  
  const { consolidationStart, consolidationEnd, candles } = consolidation;
  
  if (!candles || candles.length < 3) return { valid: false };
  
  // For a bearish flag, we look for an upward sloping support line
  // that has at least 3 touches (lows touching the line)
  
  // Find the initial two lowest points to draw the line
  let sortedByLow = [...candles].sort((a, b) => a.low - b.low);
  
  if (sortedByLow.length < 3) return { valid: false };
  
  // Get indices of two lowest points in original array
  const lowPoint1 = candles.findIndex(c => c.low === sortedByLow[0].low);
  let lowPoint2 = -1;
  
  // Find the second low point that's not adjacent to the first
  for (let i = 0; i < sortedByLow.length; i++) {
    const idx = candles.findIndex(c => c.low === sortedByLow[i].low);
    if (idx !== lowPoint1 && Math.abs(idx - lowPoint1) > 1) {
      lowPoint2 = idx;
      break;
    }
  }
  
  if (lowPoint2 === -1) return { valid: false };
  
  // Calculate trendline slope and intercept
  const x1 = lowPoint1;
  const y1 = candles[lowPoint1].low;
  const x2 = lowPoint2;
  const y2 = candles[lowPoint2].low;
  
  const slope = (y2 - y1) / (x2 - x1);
  const intercept = y1 - (slope * x1);
  
  // Function to get y-value on the trendline at a given x
  const getTrendlineValue = (x) => (slope * x) + intercept;
  
  // Count touches (candles where low is close to the trendline)
  let touchCount = 0;
  let touches = [];
  
  for (let i = 0; i < candles.length; i++) {
    const trendlineValue = getTrendlineValue(i);
    const lowValue = candles[i].low;
    const threshold = Math.abs(trendlineValue * 0.0005); // Small percentage tolerance
    
    if (Math.abs(lowValue - trendlineValue) <= threshold) {
      touchCount++;
      touches.push(i);
    }
  }
  
  return {
    valid: touchCount >= 3, // Require at least 3 touches
    slope,
    intercept,
    touches,
    touchCount
  };
}

// Helper function to check for bullish breakout
function checkBullishBreakout(data, consolidation, trendlineValidation) {
  if (!consolidation.detected || !trendlineValidation.valid || consolidation.consolidationEnd >= data.length - 1) {
    return { detected: false };
  }
  
  // Get the trendline value at the end of consolidation
  const lastConsolidationIndex = consolidation.consolidationEnd - consolidation.consolidationStart;
  const trendlineValue = (trendlineValidation.slope * lastConsolidationIndex) + trendlineValidation.intercept;
  
  // Check if price breaks above the trendline
  for (let i = consolidation.consolidationEnd + 1; i < data.length; i++) {
    if (data[i].close > trendlineValue && data[i].close > consolidation.highestHigh) {
      return {
        detected: true,
        breakoutIndex: i,
        breakoutPrice: data[i].close,
        breakoutLevel: consolidation.highestHigh
      };
    }
  }
  
  return { detected: false };
}

// Helper function to check for bearish breakout
function checkBearishBreakout(data, consolidation, trendlineValidation) {
  if (!consolidation.detected || !trendlineValidation.valid || consolidation.consolidationEnd >= data.length - 1) {
    return { detected: false };
  }
  
  // Get the trendline value at the end of consolidation
  const lastConsolidationIndex = consolidation.consolidationEnd - consolidation.consolidationStart;
  const trendlineValue = (trendlineValidation.slope * lastConsolidationIndex) + trendlineValidation.intercept;
  
  // Check if price breaks below the trendline
  for (let i = consolidation.consolidationEnd + 1; i < data.length; i++) {
    if (data[i].close < trendlineValue && data[i].close < consolidation.lowestLow) {
      return {
        detected: true,
        breakoutIndex: i,
        breakoutPrice: data[i].close,
        breakoutLevel: consolidation.lowestLow
      };
    }
  }
  
  return { detected: false };
}

// Helper function to check for bullish pullback to the breakout level
function checkBullishPullback(data, breakout) {
  if (!breakout.detected || breakout.breakoutIndex >= data.length - 1) {
    return { detected: false };
  }
  
  // Check if price pulls back to the breakout level
  for (let i = breakout.breakoutIndex + 1; i < data.length; i++) {
    if (data[i].low <= breakout.breakoutLevel && data[i].close > breakout.breakoutLevel) {
      return {
        detected: true,
        pullbackIndex: i,
        level: breakout.breakoutLevel
      };
    }
  }
  
  return { detected: false };
}

// Helper function to check for bearish pullback to the breakout level
function checkBearishPullback(data, breakout) {
  if (!breakout.detected || breakout.breakoutIndex >= data.length - 1) {
    return { detected: false };
  }
  
  // Check if price pulls back to the breakout level
  for (let i = breakout.breakoutIndex + 1; i < data.length; i++) {
    if (data[i].high >= breakout.breakoutLevel && data[i].close < breakout.breakoutLevel) {
      return {
        detected: true,
        pullbackIndex: i,
        level: breakout.breakoutLevel
      };
    }
  }
  
  return { detected: false };
}

// Function to analyze both timeframes for flag patterns
function analyzeFlagPatterns(multiTimeframeData, currencyPair) {
  const isJPYPair = currencyPair.includes('JPY');
  const pipSize = isJPYPair ? 0.01 : 0.0001;
  
  // Analyze 4-hour chart for the primary flag pattern
  const fourHourBullishFlag = detectBullishFlag(multiTimeframeData.fourHour);
  const fourHourBearishFlag = detectBearishFlag(multiTimeframeData.fourHour);
  
  // Analyze 1-hour chart for entry timing
  const oneHourBullishFlag = detectBullishFlag(multiTimeframeData.oneHour);
  const oneHourBearishFlag = detectBearishFlag(multiTimeframeData.oneHour);
  
  // Determine the pattern and entry
  let patternDetected = false;
  let direction = 'NEUTRAL';
  let entry = null;
  let stopLoss = null;
  let takeProfit = null;
  let stopLossPips = null;
  let takeProfitPips = null;
  let patternQuality = 0;
  let validTrade = false;
  
  // Check 4-hour bullish flag with 1-hour confirmation
  if (fourHourBullishFlag.detected && oneHourBullishFlag.detected) {
    patternDetected = true;
    direction = 'BUY';
    
    // Use 1-hour chart for precise entry
    entry = oneHourBullishFlag.entry || fourHourBullishFlag.entry;
    stopLoss = oneHourBullishFlag.stopLoss || fourHourBullishFlag.stopLoss;
    
    if (entry && stopLoss) {
      // Calculate stop loss in pips
      stopLossPips = Math.round(Math.abs(entry - stopLoss) / pipSize);
      
      // Calculate take profit at 2:1 ratio (always exactly 2x the stop loss distance)
      takeProfitPips = stopLossPips * 2;
      takeProfit = entry + (takeProfitPips * pipSize);
      
      // Valid trade as long as we have entry, stop loss, and pullback - no pip restrictions
      validTrade = true;
    }
    
    // Pattern quality score (0-100)
    patternQuality = 70;
    
    // Higher quality if 3-touch rule is verified on both timeframes
    if (fourHourBullishFlag.trendlineValidation.touchCount >= 3) patternQuality += 10;
    if (oneHourBullishFlag.trendlineValidation.touchCount >= 3) patternQuality += 10;
    
    // Cap at 90
    patternQuality = Math.min(patternQuality, 90);
  } 
  // Check 4-hour bearish flag with 1-hour confirmation
  else if (fourHourBearishFlag.detected && oneHourBearishFlag.detected) {
    patternDetected = true;
    direction = 'SELL';
    
    // Use 1-hour chart for precise entry
    entry = oneHourBearishFlag.entry || fourHourBearishFlag.entry;
    stopLoss = oneHourBearishFlag.stopLoss || fourHourBearishFlag.stopLoss;
    
    if (entry && stopLoss) {
      // Calculate stop loss in pips
      stopLossPips = Math.round(Math.abs(entry - stopLoss) / pipSize);
      
      // Calculate take profit at 2:1 ratio (always exactly 2x the stop loss distance)
      takeProfitPips = stopLossPips * 2;
      takeProfit = entry - (takeProfitPips * pipSize);
      
      // Valid trade as long as we have entry, stop loss, and pullback - no pip restrictions
      validTrade = true;
    }
    
    // Pattern quality score (0-100)
    patternQuality = 70;
    
    // Higher quality if 3-touch rule is verified on both timeframes
    if (fourHourBearishFlag.trendlineValidation.touchCount >= 3) patternQuality += 10;
    if (oneHourBearishFlag.trendlineValidation.touchCount >= 3) patternQuality += 10;
    
    // Cap at 90
    patternQuality = Math.min(patternQuality, 90);
  }
  
  return {
    patternDetected,
    direction,
    entry,
    stopLoss,
    takeProfit,
    stopLossPips,
    takeProfitPips,
    patternQuality,
    validTrade,
    fourHourAnalysis: {
      bullishFlag: fourHourBullishFlag,
      bearishFlag: fourHourBearishFlag
    },
    oneHourAnalysis: {
      bullishFlag: oneHourBullishFlag,
      bearishFlag: oneHourBearishFlag
    }
  };
}

module.exports = {
  detectBullishFlag,
  detectBearishFlag,
  analyzeFlagPatterns
};
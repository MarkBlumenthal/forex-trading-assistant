const { analyzeFlagPatterns } = require('./patternRecognition');

// Simplified technical analysis focused only on flag patterns
function analyzeMultiTimeframe(multiTimeframeData, currencyPair) {
  // Analyze for flag patterns
  const flagAnalysis = analyzeFlagPatterns(multiTimeframeData, currencyPair);
  
  // Determine overall direction based on flag pattern
  const overallDirection = flagAnalysis.patternDetected ? flagAnalysis.direction : 'NEUTRAL';
  const confidence = flagAnalysis.patternDetected ? flagAnalysis.patternQuality : 0;
  
  return {
    overallDirection,
    confidence,
    flagPattern: flagAnalysis,
    timeframes: {
      fourHour: { direction: overallDirection },
      oneHour: { direction: overallDirection }
    }
  };
}

module.exports = {
  analyzeMultiTimeframe
};
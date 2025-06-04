import React from 'react';

const TechnicalIndicators = ({ technical }) => {
  // Skip rendering if no flag pattern data
  if (!technical || !technical.flagPattern) return null;
  
  const flagPattern = technical.flagPattern;
  
  return (
    <div className="analysis-section">
      <h3>Flag Pattern Status</h3>
      
      <div className="flag-status">
        <p>
          <strong>Pattern Detected:</strong> {flagPattern.patternDetected ? 'Yes' : 'No'}
        </p>
        {flagPattern.patternDetected && (
          <>
            <p>
              <strong>Pattern Type:</strong> {flagPattern.direction === 'BUY' ? 'Bullish' : 'Bearish'} Flag
            </p>
            <p>
              <strong>3-Touch Rule:</strong> {
                flagPattern.fourHourAnalysis.bullishFlag.trendlineValidation?.valid || 
                flagPattern.fourHourAnalysis.bearishFlag.trendlineValidation?.valid ? 
                'Confirmed' : 'Not Confirmed'
              }
            </p>
            <p>
              <strong>Breakout:</strong> Confirmed
            </p>
            <p>
              <strong>Pullback Entry:</strong> {
                flagPattern.oneHourAnalysis.bullishFlag.pullback?.detected || 
                flagPattern.oneHourAnalysis.bearishFlag.pullback?.detected ? 
                'Ready' : 'Waiting'
              }
            </p>
            <p>
              <strong>Valid Trade:</strong> {flagPattern.validTrade ? 'Yes' : 'No'}
            </p>
            {flagPattern.stopLossPips && (
              <p>
                <strong>Stop Loss Distance:</strong> {flagPattern.stopLossPips} pips (pattern-based)
              </p>
            )}
            {flagPattern.takeProfitPips && (
              <p>
                <strong>Take Profit Distance:</strong> {flagPattern.takeProfitPips} pips (2:1 ratio)
              </p>
            )}
            {!flagPattern.validTrade && (
              <p>
                <strong>Status:</strong> Waiting for pattern completion or pullback entry
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TechnicalIndicators;
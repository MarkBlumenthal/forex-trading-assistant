import React from 'react';

const MultiTimeframeAnalysis = ({ technical }) => {
  if (!technical || !technical.multiTimeframe) return null;
  
  const { overallDirection, flagPattern } = technical.multiTimeframe;
  
  const getDirectionColor = (direction) => {
    switch(direction) {
      case 'BUY': return '#2e7d32';
      case 'SELL': return '#c62828';
      default: return '#666';
    }
  };
  
  return (
    <div className="analysis-section">
      <h3>Flag Pattern Analysis</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Pattern Direction: </strong>
        <span style={{ color: getDirectionColor(overallDirection), fontWeight: 'bold' }}>
          {overallDirection}
        </span>
      </div>
      
      {flagPattern.patternDetected ? (
        <div
  className="flag-pattern-info"
  style={{ borderLeft: `4px solid ${getDirectionColor(flagPattern.direction)}` }}
>


          <h4>{flagPattern.direction === 'BUY' ? 'Bullish' : 'Bearish'} Flag Pattern Detected</h4>
          
          {flagPattern.validTrade ? (
            <>
              <p style={{ color: '#2e7d32' }}><strong>✓ Valid Trade Setup</strong></p>
              <p><strong>3-Touch Trendline Rule:</strong> Confirmed</p>
              <p>
                <strong>Entry Price:</strong> {flagPattern.entry}
              </p>
              <p>
                <strong>Stop Loss:</strong> {flagPattern.stopLoss} ({flagPattern.stopLossPips} pips)
              </p>
              <p>
                <strong>Take Profit:</strong> {flagPattern.takeProfit} ({flagPattern.takeProfitPips} pips)
              </p>
              <p>
                <strong>Risk/Reward:</strong> 1:2 (based on pattern structure)
              </p>
              {flagPattern.trueRiskRewardRatio && (
                <p>
                  <strong>True R/R after spread:</strong> 1:{flagPattern.trueRiskRewardRatio}
                </p>
              )}
              {flagPattern.spreadPips && (
                <p>
                  <strong>Current Spread:</strong> {flagPattern.spreadPips} pips
                </p>
              )}
            </>
          ) : (
            <>
              <p style={{ color: '#c62828' }}>
                <strong>✗ Incomplete Pattern</strong>
              </p>
              <p>
                Pattern detected but waiting for pullback entry or other completion criteria
              </p>
              <p>The system will only trade when all pattern requirements are met</p>
            </>
          )}
        </div>
      ) : (
        <div className="no-pattern-info">
          <h4>No Flag Pattern Detected</h4>
          <p>Waiting for a valid flag pattern with:</p>
          <ul>
            <li>Strong directional move (flag pole)</li>
            <li>Consolidation against the trend</li>
            <li>At least 3 touches of the trendline</li>
            <li>Breakout in the direction of the original trend</li>
            <li>Pullback to the breakout level for entry</li>
          </ul>
        </div>
      )}
      
      <div className="timeframe-insights">
        <h4>Flag Pattern Trading Strategy</h4>
        <ul>
          <li>4-hour chart: Pattern identification and trend direction</li>
          <li>1-hour chart: Entry timing and precise levels</li>
          <li>Dynamic stop loss based on pattern structure (no pip limits)</li>
          <li>Take profit at exactly 2× stop loss distance (pure 2:1 ratio)</li>
          <li>3-touch trendline confirmation required</li>
          <li>Entry on pullback to the breakout level</li>
          <li>Spread-adjusted calculations for true risk/reward</li>
          <li>Pattern structure determines all risk parameters</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiTimeframeAnalysis;

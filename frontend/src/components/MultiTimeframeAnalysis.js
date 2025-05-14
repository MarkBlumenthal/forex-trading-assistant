import React from 'react';

const MultiTimeframeAnalysis = ({ technical }) => {
  if (!technical || !technical.multiTimeframe) return null;
  
  const { daily, fourHour, oneHour, fifteenMin, overallDirection, alignmentScore } = technical.multiTimeframe;
  
  const getDirectionColor = (direction) => {
    switch(direction) {
      case 'BUY': return '#2e7d32';
      case 'SELL': return '#c62828';
      default: return '#666';
    }
  };
  
  return (
    <div className="analysis-section">
      <h3>Multi-Timeframe Analysis</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Overall Direction: </strong>
        <span style={{ color: getDirectionColor(overallDirection), fontWeight: 'bold' }}>
          {overallDirection}
        </span>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Timeframe Alignment: </strong>{alignmentScore}/5
      </div>
      
      <table className="timeframe-table">
        <thead>
          <tr>
            <th>Timeframe</th>
            <th>Direction</th>
            <th>Bullish Signals</th>
            <th>Bearish Signals</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Daily</strong></td>
            <td style={{ color: getDirectionColor(daily.direction) }}>{daily.direction}</td>
            <td>{daily.bullishSignals}</td>
            <td>{daily.bearishSignals}</td>
          </tr>
          <tr>
            <td><strong>4 Hour</strong></td>
            <td style={{ color: getDirectionColor(fourHour.direction) }}>{fourHour.direction}</td>
            <td>{fourHour.bullishSignals}</td>
            <td>{fourHour.bearishSignals}</td>
          </tr>
          <tr>
            <td><strong>1 Hour</strong></td>
            <td style={{ color: getDirectionColor(oneHour.direction) }}>{oneHour.direction}</td>
            <td>{oneHour.bullishSignals}</td>
            <td>{oneHour.bearishSignals}</td>
          </tr>
          <tr>
            <td><strong>15 Min</strong></td>
            <td style={{ color: getDirectionColor(fifteenMin.direction) }}>{fifteenMin.direction}</td>
            <td>{fifteenMin.bullishSignals}</td>
            <td>{fifteenMin.bearishSignals}</td>
          </tr>
        </tbody>
      </table>
      
      <div className="timeframe-insights">
        <h4>Timeframe Insights</h4>
        <ul>
          {daily.direction === fourHour.direction && (
            <li>Daily and 4-hour timeframes aligned ({daily.direction})</li>
          )}
          {fourHour.direction === oneHour.direction && (
            <li>4-hour and 1-hour timeframes aligned ({fourHour.direction})</li>
          )}
          {oneHour.direction === fifteenMin.direction && (
            <li>1-hour and 15-minute timeframes aligned ({oneHour.direction})</li>
          )}
          {daily.direction !== fourHour.direction && (
            <li className="warning">Potential trend change: Daily ({daily.direction}) and 4-hour ({fourHour.direction}) conflict</li>
          )}
          {daily.direction === 'BUY' && fourHour.direction === 'BUY' && oneHour.direction === 'BUY' && (
            <li className="strong">Strong uptrend confirmed across multiple timeframes</li>
          )}
          {daily.direction === 'SELL' && fourHour.direction === 'SELL' && oneHour.direction === 'SELL' && (
            <li className="strong">Strong downtrend confirmed across multiple timeframes</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MultiTimeframeAnalysis;
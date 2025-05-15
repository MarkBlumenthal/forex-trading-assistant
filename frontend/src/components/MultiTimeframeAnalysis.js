import React from 'react';

const MultiTimeframeAnalysis = ({ technical }) => {
  if (!technical || !technical.multiTimeframe) return null;
  
  const { oneHour, thirtyMin, fifteenMin, fiveMin, overallDirection, alignmentScore } = technical.multiTimeframe;
  
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
            <td><strong>1 Hour</strong></td>
            <td style={{ color: getDirectionColor(oneHour.direction) }}>{oneHour.direction}</td>
            <td>{oneHour.bullishSignals}</td>
            <td>{oneHour.bearishSignals}</td>
          </tr>
          <tr>
            <td><strong>30 Minute</strong></td>
            <td style={{ color: getDirectionColor(thirtyMin.direction) }}>{thirtyMin.direction}</td>
            <td>{thirtyMin.bullishSignals}</td>
            <td>{thirtyMin.bearishSignals}</td>
          </tr>
          <tr>
            <td><strong>15 Minute</strong></td>
            <td style={{ color: getDirectionColor(fifteenMin.direction) }}>{fifteenMin.direction}</td>
            <td>{fifteenMin.bullishSignals}</td>
            <td>{fifteenMin.bearishSignals}</td>
          </tr>
          <tr>
            <td><strong>5 Minute</strong></td>
            <td style={{ color: getDirectionColor(fiveMin.direction) }}>{fiveMin.direction}</td>
            <td>{fiveMin.bullishSignals}</td>
            <td>{fiveMin.bearishSignals}</td>
          </tr>
        </tbody>
      </table>
      
      <div className="timeframe-insights">
        <h4>Timeframe Insights</h4>
        <ul>
          {oneHour.direction === thirtyMin.direction && oneHour.direction !== 'NEUTRAL' && (
            <li>1-hour and 30-minute timeframes aligned ({oneHour.direction})</li>
          )}
          {thirtyMin.direction === fifteenMin.direction && thirtyMin.direction !== 'NEUTRAL' && (
            <li>30-minute and 15-minute timeframes aligned ({thirtyMin.direction})</li>
          )}
          {fifteenMin.direction === fiveMin.direction && fifteenMin.direction !== 'NEUTRAL' && (
            <li>15-minute and 5-minute timeframes aligned ({fifteenMin.direction})</li>
          )}
          {oneHour.direction !== thirtyMin.direction && 
           oneHour.direction !== 'NEUTRAL' && 
           thirtyMin.direction !== 'NEUTRAL' && (
            <li className="warning">Potential trend change: 1-hour ({oneHour.direction}) and 30-minute ({thirtyMin.direction}) conflict</li>
          )}
          {oneHour.direction === 'BUY' && 
           thirtyMin.direction === 'BUY' && 
           fifteenMin.direction === 'BUY' && (
            <li className="strong">Strong uptrend confirmed across multiple timeframes</li>
          )}
          {oneHour.direction === 'SELL' && 
           thirtyMin.direction === 'SELL' && 
           fifteenMin.direction === 'SELL' && (
            <li className="strong">Strong downtrend confirmed across multiple timeframes</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MultiTimeframeAnalysis;
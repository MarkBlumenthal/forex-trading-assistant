import React from 'react';

const TechnicalIndicators = ({ technical }) => {
  if (!technical) return null;

  const { indicators, analysis } = technical;

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(4);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val?.toFixed?.(4) || val}`)
        .join(', ');
    }
    return value || 'N/A';
  };

  return (
    <>
      <div className="analysis-section">
        <h3>Technical Indicators</h3>
        <div className="indicators-grid">
          <div className="indicator-card">
            <h4>RSI (14)</h4>
            <div className="value">{formatValue(indicators.rsi)}</div>
          </div>
          
          <div className="indicator-card">
            <h4>Current Price</h4>
            <div className="value">{formatValue(indicators.currentPrice)}</div>
          </div>
          
          <div className="indicator-card">
            <h4>Trend</h4>
            <div className="value">{indicators.trend}</div>
          </div>
          
          <div className="indicator-card">
            <h4>SMA 20</h4>
            <div className="value">{formatValue(indicators.sma20)}</div>
          </div>
          
          <div className="indicator-card">
            <h4>SMA 50</h4>
            <div className="value">{formatValue(indicators.sma50)}</div>
          </div>
          
          <div className="indicator-card">
            <h4>ATR (14)</h4>
            <div className="value">{formatValue(indicators.atr)}</div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>MACD</h4>
          <p>{formatValue(indicators.macd)}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Bollinger Bands</h4>
          <p>{formatValue(indicators.bollingerBands)}</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Stochastic</h4>
          <p>{formatValue(indicators.stochastic)}</p>
        </div>
      </div>

      <div className="analysis-section">
        <h3>Technical Analysis</h3>
        <div style={{ marginBottom: '15px' }}>
          <strong>Direction: </strong>
          <span style={{
            color: analysis.direction === 'BUY' ? '#2e7d32' : 
                   analysis.direction === 'SELL' ? '#c62828' : '#666'
          }}>
            {analysis.direction}
          </span>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Bullish Signals: </strong>{analysis.bullishSignals}<br />
          <strong>Bearish Signals: </strong>{analysis.bearishSignals}
        </div>

        <h4>Active Signals</h4>
        <ul className="signal-list">
          {analysis.signals.map((signal, index) => (
            <li key={index}>{signal}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default TechnicalIndicators;
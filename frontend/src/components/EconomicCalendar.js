import React from 'react';

const EconomicCalendar = ({ economic }) => {
  if (!economic) return null;

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'PROCEED': return '#2e7d32';
      case 'CAUTION': return '#f57c00';
      case 'AVOID': return '#c62828';
      default: return '#666';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'HIGH': return '#c62828';
      case 'MEDIUM': return '#f57c00';
      case 'LOW': return '#2e7d32';
      default: return '#666';
    }
  };

  return (
    <div className="analysis-section">
      <h3>Economic Calendar</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Trading Recommendation: </strong>
        <span style={{ 
          color: getRecommendationColor(economic.tradingRecommendation),
          fontWeight: 'bold'
        }}>
          {economic.tradingRecommendation}
        </span>
      </div>

      {economic.hasHighImpactEvents && (
        <div style={{
          padding: '10px',
          background: '#ffebee',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          ⚠️ High impact economic events scheduled today
        </div>
      )}

      <h4>Today's Economic Events</h4>
      {economic.events.length === 0 ? (
        <p>No significant {economic.currencyPair} events scheduled</p>
      ) : (
        <ul className="event-list">
          {economic.events.map((event, index) => (
            <li key={index} className="event-item">
              <span className="event-time">{event.time}</span>
              <span className="event-name">
                {event.name}
                {event.currency && ` (${event.currency})`}
              </span>
              <span 
                className={`event-impact ${event.impact}`}
                style={{
                  backgroundColor: getImpactColor(event.impact) + '20',
                  color: getImpactColor(event.impact)
                }}
              >
                {event.impact}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EconomicCalendar;
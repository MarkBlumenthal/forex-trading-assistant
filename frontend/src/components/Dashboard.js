import React from 'react';
import GaugeChart from 'react-gauge-chart';
import PriceChart from './PriceChart';
import TechnicalIndicators from './TechnicalIndicators';
import NewsSection from './NewsSection';
import EconomicCalendar from './EconomicCalendar';

const Dashboard = ({ analysis }) => {
  if (!analysis) return null;

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'BUY': return '#2e7d32';
      case 'SELL': return '#c62828';
      case 'WAIT': return '#f57c00';
      default: return '#666';
    }
  };

  const getActionText = () => {
    if (analysis.decision === 'WAIT') return 'DO NOT TRADE';
    return `${analysis.decision} ${analysis.direction || ''}`.trim();
  };

  return (
    <div className="dashboard">
      {/* Main Decision Panel */}
      <div className="decision-panel">
        <h2>Trading Decision</h2>
        <div className="decision-content">
          <div 
            className={`decision-action ${analysis.decision}`}
            style={{ color: getDecisionColor(analysis.decision) }}
          >
            {getActionText()}
          </div>
          
          <div className="confidence-meter">
            <GaugeChart 
              id="confidence-gauge"
              nrOfLevels={30}
              percent={analysis.confidence / 100}
              arcWidth={0.3}
              colors={['#c62828', '#f57c00', '#2e7d32']}
              textColor="#000"
              formatTextValue={() => `${analysis.confidence}%`}
            />
            <p>Confidence Level</p>
          </div>

        
<p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
  Minimum threshold: 80% | Current: {analysis.confidence}%
</p>

          <div className="reasoning">
            <h3>Reasoning</h3>
            <ul>
              {analysis.reasoning.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>

          {analysis.risks.length > 0 && (
            <div className="risks">
              <h3>Risks</h3>
              <ul>
                {analysis.risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Price Chart */}
      <div className="chart-container">
        <PriceChart data={analysis.priceData} />
      </div>

      {/* Analysis Grid */}
      <div className="analysis-grid">
        <TechnicalIndicators technical={analysis.technical} />
        <NewsSection news={analysis.news} />
        <EconomicCalendar economic={analysis.economic} />
      </div>
    </div>
  );
};

export default Dashboard;
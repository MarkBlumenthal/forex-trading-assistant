import React from 'react';

const PositionSizing = ({ positionData, decision }) => {
  if (!positionData || decision !== 'TRADE') return null;

  return (
    <div className="position-sizing">
      <h3>Position Sizing & Trade Setup</h3>
      <div className="position-grid">
        <div className="position-card">
          <h4>Account Info</h4>
          <p>Balance: £{positionData.accountBalance}</p>
          <p>Risk per trade: £{positionData.riskPerTrade.toFixed(2)} ({positionData.maxRiskPercent}%)</p>
        </div>
        
        <div className="position-card">
          <h4>Daily Targets</h4>
          <p>Daily target: £{positionData.dailyTarget.toFixed(2)}</p>
          <p>Required pips: {positionData.requiredPips}</p>
        </div>
        
        <div className="position-card">
          <h4>Trade Setup</h4>
          <p>Lot size: {positionData.recommendedLotSize}</p>
          <p>Stop loss: {positionData.stopLossPips} pips</p>
          <p>Take profit: {positionData.takeProfitPips} pips</p>
        </div>
        
        <div className="position-card">
          <h4>Risk/Reward</h4>
          <p>Risk: £{positionData.riskPerTrade.toFixed(2)}</p>
          <p>Potential profit: £{(positionData.takeProfitPips * positionData.pipValue * positionData.recommendedLotSize).toFixed(2)}</p>
          <p>R:R Ratio: 1:{(positionData.takeProfitPips / positionData.stopLossPips).toFixed(1)}</p>
        </div>
      </div>
      
      <div className="mt4-instructions">
        <h4>MT4 Setup Instructions:</h4>
        <ol>
          <li>Open EUR/USD chart in MT4</li>
          <li>Set order type: Market Order</li>
          <li>Volume: {positionData.recommendedLotSize} lots</li>
          <li>Stop Loss: {positionData.stopLossPips} pips from entry</li>
          <li>Take Profit: {positionData.takeProfitPips} pips from entry</li>
        </ol>
      </div>
    </div>
  );
};

export default PositionSizing;
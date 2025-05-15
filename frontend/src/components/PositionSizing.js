import React from 'react';

const PositionSizing = ({ positionData, decision }) => {
  if (!positionData || decision !== 'TRADE') return null;

  // Select the appropriate setup based on trade direction
  const tradeSetup = positionData.direction === 'BUY' ? positionData.buySetup : positionData.sellSetup;

  return (
    <div className="position-sizing">
      <h3>Position Sizing & Trade Setup for {positionData.currencyPair}</h3>
      <div className="position-grid">
        <div className="position-card">
          <h4>Account Info</h4>
          <p>Balance: £{positionData.accountBalance}</p>
          <p>Risk per trade: £{positionData.riskPerTrade.toFixed(2)} ({positionData.maxRiskPercent}%)</p>
        </div>
        
        <div className="position-card">
          <h4>Trade Targets</h4>
          <p>Target profit: £{positionData.targetProfit.toFixed(2)}</p>
          <p>Required pips: {positionData.takeProfitPips}</p>
          <p>Projected profit: £{positionData.projectedProfit.toFixed(2)}</p>
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
          <p>Reward: £{positionData.targetProfit.toFixed(2)}</p>
          <p>R:R Ratio: 1:{positionData.riskRewardRatio.toFixed(1)}</p>
        </div>
      </div>
      
      <div className="trade-prices">
        <h4>Exact Price Levels:</h4>
        <div className="trade-prices-grid">
          <div className="price-card entry">
            <strong>Entry Price:</strong>
            <span>{tradeSetup.entry}</span>
          </div>
          <div className="price-card stop-loss">
            <strong>Stop Loss Price:</strong>
            <span>{tradeSetup.stopLoss}</span>
          </div>
          <div className="price-card take-profit">
            <strong>Take Profit Price:</strong>
            <span>{tradeSetup.takeProfit}</span>
          </div>
        </div>
      </div>
      
      <div className="mt4-instructions">
        <h4>MT4 Setup Instructions:</h4>
        <ol>
          <li>Open {positionData.currencyPair} chart in MT4</li>
          <li>Set order type: Market Order</li>
          <li>Direction: {positionData.direction}</li>
          <li>Volume: {positionData.recommendedLotSize} lots</li>
          <li>Entry Price: {tradeSetup.entry}</li>
          <li>Stop Loss: {tradeSetup.stopLoss}</li>
          <li>Take Profit: {tradeSetup.takeProfit}</li>
        </ol>
      </div>
    </div>
  );
};

export default PositionSizing;
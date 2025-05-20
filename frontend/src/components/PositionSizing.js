import React from 'react';

const PositionSizing = ({ positionData, decision }) => {
  if (!positionData || decision !== 'TRADE') return null;

  return (
    <div className="position-sizing">
      <h3>Position Sizing & Trade Setup for {positionData.currencyPair}</h3>
      <div className="position-grid">
        <div className="position-card">
          <h4>Account Info</h4>
          <p>Balance: £{positionData.accountBalance}</p>
          <p>Risk per trade: £{positionData.riskAmount.toFixed(2)} ({positionData.riskPercent}%)</p>
        </div>
        
        <div className="position-card">
          <h4>Trade Targets</h4>
          <p>Risk: £{positionData.riskAmount.toFixed(2)}</p>
          <p>Reward: £{positionData.projectedProfit.toFixed(2)}</p>
          <p>Target R:R Ratio: 1:2</p>
          <p>Actual R:R Ratio (after spread): 1:{positionData.trueRiskRewardRatio}</p>
        </div>
        
        <div className="position-card">
          <h4>Trade Setup</h4>
          <p>Lot size: {positionData.recommendedLotSize}</p>
          <p>Stop loss: {positionData.stopLossPips} pips</p>
          <p>Take profit: {positionData.takeProfitPips} pips</p>
          <p>Spread: {positionData.spreadPips} pips</p>
        </div>
      </div>
      
      <div className="trade-prices">
        <h4>Exact Price Levels (Includes Spread):</h4>
        <div className="trade-prices-grid">
          <div className="price-card entry">
            <strong>Entry Price:</strong>
            <span>{positionData.entryPrice}</span>
          </div>
          <div className="price-card stop-loss">
            <strong>Stop Loss Price:</strong>
            <span>{positionData.stopLossPrice}</span>
          </div>
          <div className="price-card take-profit">
            <strong>Take Profit Price:</strong>
            <span>{positionData.takeProfitPrice}</span>
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
          <li>Entry Price: {positionData.entryPrice} (includes spread)</li>
          <li>Stop Loss: {positionData.stopLossPrice}</li>
          <li>Take Profit: {positionData.takeProfitPrice}</li>
        </ol>
      </div>
    </div>
  );
};

export default PositionSizing;
import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ReferenceLine, ComposedChart, Scatter, Line, Brush
} from 'recharts';

const PriceChart = ({ data, currencyPair, fourHourData, oneHourData, flagPattern }) => {
  const [timeframe, setTimeframe] = useState('1hour'); // Default to 1-hour chart
  
  // Early return if no data
  if (!data) return <div className="chart-placeholder">No price data available</div>;
  
  // Format the right data based on timeframe
  const formattedData = (timeframe === '4hour' ? fourHourData : oneHourData) || [];
  
  // Format data for candlestick chart
  const candlestickData = formattedData.map((candle, index) => {
    return {
      time: new Date(candle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(candle.time).toLocaleDateString(),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      gain: candle.close > candle.open,
      loss: candle.close < candle.open,
      index: index, // Store index for reference
    };
  });
  
  // Take just the last 30 candles for display
  const displayData = candlestickData.slice(-30);
  
  // Calculate data range for YAxis
  const minValue = Math.min(...displayData.map(item => item.low));
  const maxValue = Math.max(...displayData.map(item => item.high));
  const padding = (maxValue - minValue) * 0.1; // 10% padding
  
  // Create flag pattern visualization elements if pattern is detected
  let patternElements = [];
  
  if (flagPattern && flagPattern.patternDetected) {
    // Find the right pattern based on direction and timeframe
    const relevantPattern = timeframe === '4hour' 
      ? (flagPattern.direction === 'BUY' ? flagPattern.fourHourAnalysis.bullishFlag : flagPattern.fourHourAnalysis.bearishFlag)
      : (flagPattern.direction === 'BUY' ? flagPattern.oneHourAnalysis.bullishFlag : flagPattern.oneHourAnalysis.bearishFlag);
    
    // Only draw if we have valid data
    if (relevantPattern && relevantPattern.detected) {
      const relevantData = timeframe === '4hour' ? fourHourData : oneHourData;
      
      // Create pole visualization if we have pole data
      if (relevantPattern.pole) {
        const poleStart = relevantPattern.pole.startIndex;
        const poleEnd = relevantPattern.pole.endIndex;
        
        if (poleStart < displayData.length && poleEnd < displayData.length) {
          patternElements.push(
            <Line
              key="flagpole"
              type="monotone"
              dataKey="poleValue"
              stroke="#ff7300"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          );
          
          // Add pole values to data
          displayData.forEach((candle, i) => {
            if (i >= poleStart && i <= poleEnd) {
              displayData[i].poleValue = flagPattern.direction === 'BUY' 
                ? relevantData[i].high 
                : relevantData[i].low;
            }
          });
        }
      }
      
      // Add trendline if we have valid trendline data
      if (relevantPattern.trendlineValidation && relevantPattern.trendlineValidation.valid) {
        const { slope, intercept } = relevantPattern.trendlineValidation;
        
        // Add trendline values
        displayData.forEach((candle, i) => {
          if (relevantPattern.consolidation && 
              i >= relevantPattern.consolidation.consolidationStart && 
              i <= relevantPattern.consolidation.consolidationEnd) {
            displayData[i].trendline = (slope * i) + intercept;
          }
        });
        
        patternElements.push(
          <Line
            key="trendline"
            type="monotone"
            dataKey="trendline"
            stroke="#8884d8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        );
      }
      
      // Add entry, stop loss and take profit lines if we have valid trade
      if (flagPattern.validTrade) {
        patternElements.push(
          <ReferenceLine 
            key="entry" 
            y={flagPattern.entry} 
            stroke="green" 
            strokeDasharray="3 3" 
            label={{ position: 'right', value: 'Entry', fill: 'green', fontSize: 12 }} 
          />
        );
        
        patternElements.push(
          <ReferenceLine 
            key="sl" 
            y={flagPattern.stopLoss} 
            stroke="red" 
            strokeDasharray="3 3" 
            label={{ position: 'right', value: 'SL', fill: 'red', fontSize: 12 }} 
          />
        );
        
        patternElements.push(
          <ReferenceLine 
            key="tp" 
            y={flagPattern.takeProfit} 
            stroke="blue" 
            strokeDasharray="3 3" 
            label={{ position: 'right', value: 'TP', fill: 'blue', fontSize: 12 }} 
          />
        );
      }
    }
  }
  
  return (
    <div className="chart-container">
      <div className="timeframe-selector">
        <button 
          className={timeframe === '4hour' ? 'active' : ''} 
          onClick={() => setTimeframe('4hour')}
        >
          4-Hour Chart
        </button>
        <button 
          className={timeframe === '1hour' ? 'active' : ''} 
          onClick={() => setTimeframe('1hour')}
        >
          1-Hour Chart
        </button>
      </div>
      
      <div className="candlestick-chart">
        <h3>{timeframe === '4hour' ? '4-Hour' : '1-Hour'} Chart for {currencyPair}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={displayData} margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              scale="band" 
              padding={{ left: 10, right: 10 }} 
            />
            <YAxis 
              domain={[minValue - padding, maxValue + padding]} 
              tickCount={8} 
              width={60}
            />
            <Tooltip 
              labelFormatter={(label) => `Time: ${label}`} 
              formatter={(value, name) => {
                if (name === 'poleValue' || name === 'trendline') return [null, ''];
                return [value.toFixed(5), name.charAt(0).toUpperCase() + name.slice(1)];
              }}
            />
            <Legend />
            
            {/* Candlesticks */}
            <Bar 
              dataKey="high" 
              fill="transparent" 
              stroke="transparent" 
              isAnimationActive={false} 
            />
            <Bar 
              dataKey="low" 
              fill="transparent" 
              stroke="transparent" 
              isAnimationActive={false} 
            />
            
            {/* Green candles for bullish (gain) */}
            <Bar 
              dataKey={(d) => d.gain ? [d.open, d.close] : [0, 0]} 
              fill="#2e7d32" 
              stroke="#2e7d32" 
              isAnimationActive={false} 
            />
            
            {/* Red candles for bearish (loss) */}
            <Bar 
              dataKey={(d) => d.loss ? [d.open, d.close] : [0, 0]} 
              fill="#c62828" 
              stroke="#c62828" 
              isAnimationActive={false} 
            />
            
            {/* Candle wicks */}
            <Line 
              type="monotone" 
              dataKey={(d) => [d.low, d.high]} 
              stroke="black" 
              dot={false} 
              activeDot={false} 
              isAnimationActive={false} 
            />
            
            {/* Flag pattern elements */}
            {patternElements}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {flagPattern && flagPattern.patternDetected && (
        <div className="pattern-info" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h4>{flagPattern.direction === 'BUY' ? 'Bullish' : 'Bearish'} Flag Pattern Detected</h4>
          <p>
            View the {timeframe === '4hour' ? '4-Hour' : '1-Hour'} chart to see the pattern details.
            The {flagPattern.direction === 'BUY' ? 'bullish' : 'bearish'} flag consists of a strong move (orange line) 
            followed by a consolidation against the trend (purple dotted line).
          </p>
          {flagPattern.validTrade && (
            <p>
              <strong>Trade Setup:</strong> Entry (green), Stop Loss (red), Take Profit (blue).
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceChart;
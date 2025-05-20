import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

const PriceChart = ({ data, currencyPair, fourHourData, oneHourData, flagPattern }) => {
  const [timeframe, setTimeframe] = useState('1hour');
  const [chartData, setChartData] = useState([]);
  const [options, setOptions] = useState({});

  useEffect(() => {
    // Select the data based on timeframe
    const formattedData = (timeframe === '4hour' ? fourHourData : oneHourData) || [];
    
    // Get last 30 candles
    const displayData = formattedData.slice(-30);
    
    // Format data for ApexCharts
    const candleSeries = [{
      name: 'Candle',
      data: displayData.map(candle => ({
        x: new Date(candle.time),
        y: [candle.open, candle.high, candle.low, candle.close]
      }))
    }];
    
    // Calculate Y-axis range
    const yValues = displayData.flatMap(candle => [candle.high, candle.low]);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const padding = (maxY - minY) * 0.1; // 10% padding
    
    // Default chart options
    const chartOptions = {
      chart: {
        type: 'candlestick',
        height: 400,
        toolbar: {
          show: false,
        },
        background: '#fff',
      },
      title: {
        text: `${timeframe === '4hour' ? '4-Hour' : '1-Hour'} Chart for ${currencyPair}`,
        align: 'center'
      },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
          format: 'HH:mm',
        }
      },
      yaxis: {
        min: minY - padding,
        max: maxY + padding,
        tooltip: {
          enabled: true
        },
        decimalsInFloat: 5,
      },
      tooltip: {
        enabled: true,
        x: {
          format: 'MMM dd HH:mm'
        }
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#2e7d32',
            downward: '#c62828'
          },
          wick: {
            useFillColor: true,
          }
        }
      },
      annotations: {
        points: [],
        yaxis: []
      }
    };
    
    // Add flag pattern visualization if a pattern is detected
    if (flagPattern && flagPattern.patternDetected && flagPattern.validTrade) {
      // Add entry, stop loss and take profit lines
      chartOptions.annotations.yaxis = [
        {
          y: flagPattern.entry,
          strokeDashArray: 0,
          borderColor: '#00E396',
          label: {
            borderColor: '#00E396',
            style: {
              color: '#fff',
              background: '#00E396'
            },
            text: 'Entry'
          }
        },
        {
          y: flagPattern.stopLoss,
          strokeDashArray: 0,
          borderColor: '#FF4560',
          label: {
            borderColor: '#FF4560',
            style: {
              color: '#fff',
              background: '#FF4560'
            },
            text: 'Stop Loss'
          }
        },
        {
          y: flagPattern.takeProfit,
          strokeDashArray: 0,
          borderColor: '#2196F3',
          label: {
            borderColor: '#2196F3',
            style: {
              color: '#fff',
              background: '#2196F3'
            },
            text: 'Take Profit'
          }
        }
      ];
    }
    
    setOptions(chartOptions);
    setChartData(candleSeries);
    
  }, [timeframe, data, currencyPair, fourHourData, oneHourData, flagPattern]);

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
        {chartData.length > 0 && (
          <ReactApexChart 
            options={options} 
            series={chartData} 
            type="candlestick" 
            height={400} 
          />
        )}
      </div>
      
      {flagPattern && flagPattern.patternDetected && (
        <div className="pattern-info" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h4>{flagPattern.direction === 'BUY' ? 'Bullish' : 'Bearish'} Flag Pattern Detected</h4>
          <p>
            View the {timeframe === '4hour' ? '4-Hour' : '1-Hour'} chart to see the pattern details.
            The {flagPattern.direction === 'BUY' ? 'bullish' : 'bearish'} flag consists of a strong move 
            followed by a consolidation against the trend.
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
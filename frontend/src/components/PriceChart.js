import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PriceChart = ({ data, currencyPair = 'EUR/USD' }) => {
  if (!data || data.length === 0) return <div>No price data available</div>;

  // Format data for chart
  const chartData = data.map(item => ({
    time: new Date(item.time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    price: item.close,
    high: item.high,
    low: item.low
  }));

  // Calculate price range for Y-axis
  const prices = data.map(d => [d.high, d.low]).flat();
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const yMin = minPrice - priceRange * 0.1;
  const yMax = maxPrice + priceRange * 0.1;

  // Determine decimal places based on currency pair
  const isJPYPair = currencyPair.includes('JPY');
  const decimalPlaces = isJPYPair ? 3 : 5;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p>{`Time: ${label}`}</p>
          <p style={{ color: '#1976d2' }}>{`Price: ${payload[0].value.toFixed(decimalPlaces)}`}</p>
          {payload[1] && <p style={{ color: '#2e7d32' }}>{`High: ${payload[1].value.toFixed(decimalPlaces)}`}</p>}
          {payload[2] && <p style={{ color: '#c62828' }}>{`Low: ${payload[2].value.toFixed(decimalPlaces)}`}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analysis-section">
      <h3>{currencyPair} Price Chart (15-minute)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={[yMin, yMax]}
            tickFormatter={(value) => value.toFixed(decimalPlaces)}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke="#1976d2"
            strokeWidth={2}
            dot={false}
            name="Close"
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke="#2e7d32"
            strokeWidth={1}
            dot={false}
            strokeDasharray="3 3"
            name="High"
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#c62828"
            strokeWidth={1}
            dot={false}
            strokeDasharray="3 3"
            name="Low"
          />
          
          {/* Current price reference line */}
          <ReferenceLine 
            y={data[data.length - 1].close} 
            stroke="#ff9800" 
            strokeDasharray="5 5"
            label="Current"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
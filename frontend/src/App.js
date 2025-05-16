import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import AccountSettings from './components/AccountSettings';
import './App.css';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currencyPairs, setCurrencyPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [accountSettings, setAccountSettings] = useState({
    accountBalance: 1000,
    targetProfit: 50
  });

  useEffect(() => {
    // Fetch available currency pairs
    axios.get('http://localhost:5000/api/currency-pairs')
      .then(response => {
        setCurrencyPairs(response.data);
      })
      .catch(err => console.error('Error fetching currency pairs:', err));
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/analysis', {
        params: { pair: selectedPair }
      });
      setAnalysis(response.data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch analysis');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysisNow = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze-now', {
        currencyPair: selectedPair,
        timeframe: 'current',
        accountSettings
      });
      setAnalysis(response.data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to run analysis');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAccountSettings = async (newSettings) => {
    try {
      await axios.post('http://localhost:5000/api/account-settings', newSettings);
      setAccountSettings(newSettings);
      // Re-run analysis with new settings
      await runAnalysisNow();
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const handlePairChange = (pair) => {
    setSelectedPair(pair);
    setAnalysis(null); // Clear previous analysis
  };

  useEffect(() => {
    if (selectedPair) {
      fetchAnalysis();
    }
  }, [selectedPair]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Forex Flag Pattern Trader</h1>
        <div className="header-info">
          <span>Multi-Currency Flag Pattern Analysis</span>
          {lastUpdate && <span>Last Update: {lastUpdate}</span>}
        </div>
      </header>
      
      <main>
        {loading && <div className="loading">Loading analysis...</div>}
        {error && <div className="error">{error}</div>}
        
        <div className="currency-selector">
          {currencyPairs.map(pair => (
            <button
              key={pair}
              onClick={() => handlePairChange(pair)}
              className={selectedPair === pair ? 'active' : ''}
            >
              {pair}
            </button>
          ))}
        </div>
        
        <div className="controls">
          <button onClick={runAnalysisNow} disabled={loading}>
            Analyze {selectedPair} Now
          </button>
          <button onClick={fetchAnalysis} disabled={loading}>
            Refresh
          </button>
        </div>
        
        <AccountSettings 
          settings={accountSettings}
          onUpdate={updateAccountSettings}
        />
        
        {analysis && analysis.decision && (
          <Dashboard analysis={analysis} />
        )}
        
        {analysis && !analysis.decision && (
          <div className="no-data">
            <p>No analysis available yet for {selectedPair}.</p>
            <p>Click 'Analyze Now' to run analysis.</p>
          </div>
        )}
      </main>
      
      <footer className="App-footer">
        <p>Flag Pattern Strategy: 4H & 1H Analysis | 3-Touch Trendline Rule | 20-pip SL | 60-pip TP | 3:1 RR</p>
      </footer>
    </div>
  );
}

export default App;
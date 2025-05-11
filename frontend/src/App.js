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
  const [accountSettings, setAccountSettings] = useState({
    accountBalance: 1000,
    monthlyTarget: 6500
  });

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/analysis');
      setAnalysis(response.data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch analysis');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysisNow = async (timeframe = 'current') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze-now', {
        timeframe,
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
      await runAnalysisNow('current');
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    
    // Refresh every minute
    const interval = setInterval(fetchAnalysis, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>EUR/USD Trading Assistant</h1>
        <div className="header-info">
          <span>Multi-Time Analysis</span>
          {lastUpdate && <span>Last Update: {lastUpdate}</span>}
        </div>
      </header>
      
      <main>
        {loading && <div className="loading">Loading analysis...</div>}
        {error && <div className="error">{error}</div>}
        
        <div className="controls">
          <button onClick={() => runAnalysisNow('current')} disabled={loading}>
            Analyze Now
          </button>
          <button onClick={() => runAnalysisNow('london-open')} disabled={loading}>
            London Open Analysis
          </button>
          <button onClick={() => runAnalysisNow('us-open')} disabled={loading}>
            US Open Analysis
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
            <p>No analysis available yet.</p>
            <p>Click 'Analyze Now' or wait for scheduled analysis.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
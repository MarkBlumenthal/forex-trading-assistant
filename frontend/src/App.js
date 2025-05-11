import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

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

  const runAnalysisNow = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/analyze-now');
      setAnalysis(response.data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to run analysis');
      console.error('Error:', err);
    } finally {
      setLoading(false);
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
          <span>London Open Analysis</span>
          {lastUpdate && <span>Last Update: {lastUpdate}</span>}
        </div>
      </header>
      
      <main>
        {loading && <div className="loading">Loading analysis...</div>}
        {error && <div className="error">{error}</div>}
        
        <div className="controls">
          <button onClick={runAnalysisNow} disabled={loading}>
            Run Analysis Now
          </button>
          <button onClick={fetchAnalysis} disabled={loading}>
            Refresh
          </button>
        </div>
        
        {analysis && analysis.decision && (
          <Dashboard analysis={analysis} />
        )}
        
        {analysis && !analysis.decision && (
          <div className="no-data">
            <p>No analysis available yet.</p>
            <p>Automatic analysis runs at 9:30 AM Israel time on weekdays.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
import React from 'react';

const NewsSection = ({ news }) => {
  if (!news) return null;

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'BULLISH':
      case 'EUR_POSITIVE':
        return '#2e7d32';
      case 'BEARISH':
      case 'USD_POSITIVE':
        return '#c62828';
      default:
        return '#666';
    }
  };

  return (
    <div className="analysis-section">
      <h3>Market News Analysis</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Overall Sentiment: </strong>
        <span 
          className={`sentiment ${news.sentiment}`}
          style={{ color: getSentimentColor(news.sentiment) }}
        >
          {news.sentiment}
        </span>
      </div>

      {news.keyEvents.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Key Events</h4>
          {news.keyEvents.map((event, index) => (
            <div key={index} style={{
              padding: '10px',
              margin: '5px 0',
              background: '#ffebee',
              borderRadius: '4px'
            }}>
              <strong>{event.title}</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Impact: {event.impact}
              </div>
            </div>
          ))}
        </div>
      )}

      <h4>Latest News</h4>
      <div className="news-list">
        {news.articles.slice(0, 5).map((article, index) => (
          <div key={index} className="news-item">
            <h4>{article.title}</h4>
            <p>{article.description}</p>
            <div className="news-meta">
              <span>Source: {article.source}</span>
              <span>•</span>
              <span 
                className="sentiment"
                style={{ color: getSentimentColor(article.sentiment) }}
              >
                {article.sentiment}
              </span>
              <span>•</span>
              <span>Impact: {article.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
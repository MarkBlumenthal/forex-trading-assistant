function formatTime(date) {
    return new Date(date).toLocaleString('en-US', {
      timeZone: 'Asia/Jerusalem',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function calculatePips(price1, price2) {
    return Math.round((price1 - price2) * 10000);
  }
  
  function formatPercentage(value) {
    return `${(value * 100).toFixed(2)}%`;
  }
  
  module.exports = {
    formatTime,
    calculatePips,
    formatPercentage
  };
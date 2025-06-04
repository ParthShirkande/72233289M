import axios from 'axios';

const BASE_URL = 'http://20.244.56.144/evaluation-service';
const AUTH_TOKEN =  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5MDI0NjQ5LCJpYXQiOjE3NDkwMjQzNDksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjFmM2RmNjkyLTk5YzYtNGY0Ni1hYzJiLWNlZmI2MDM4ZGM3MSIsInN1YiI6InBhcnRoc2hpcmthbmRlOTZAZ21haWwuY29tIn0sImVtYWlsIjoicGFydGhzaGlya2FuZGU5NkBnbWFpbC5jb20iLCJuYW1lIjoicGFydGggc2hpcmthbmRlIiwicm9sbE5vIjoiNzIyMzMyODltIiwiYWNjZXNzQ29kZSI6IktSalVVVSIsImNsaWVudElEIjoiMWYzZGY2OTItOTljNi00ZjQ2LWFjMmItY2VmYjYwMzhkYzcxIiwiY2xpZW50U2VjcmV0IjoiR2VQdWV2UXd4UmZVdEFjUiJ9.BqZTdXGWcsQazTHH3i675t_z-bB3iShtYo_um6mYaTw"


const getStockHistory = async (ticker, minutes) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/stocks/${ticker}?minutes=${minutes}`,
      { headers: { Authorization: AUTH_TOKEN } }
    );

    const priceData = response.data.stocks || [response.data.stock];
    return { priceHistory: priceData };
  } catch (error) {
    console.error('Error fetching stock history:', error.message);
    return { priceHistory: [] };
  }
};

export const getAveragePrice = async (ticker, minutes) => {
  const { priceHistory } = await getStockHistory(ticker, minutes);

  if (!priceHistory || priceHistory.length === 0) {
    return { averageStockPrice: 0, priceHistory: [] };
  }

  const total = priceHistory.reduce((sum, entry) => sum + entry.price, 0);
  const avg = total / priceHistory.length;

  return {
    averageStockPrice: parseFloat(avg.toFixed(6)),
    priceHistory,
  };
};

export const getCorrelation = async (ticker1, ticker2, minutes) => {
  const { priceHistory: history1 } = await getStockHistory(ticker1, minutes);
  const { priceHistory: history2 } = await getStockHistory(ticker2, minutes);

  if (!history1.length || !history2.length) {
    return {
      correlation: 0,
      stocks: {
        [ticker1]: { averagePrice: 0, priceHistory: history1 },
        [ticker2]: { averagePrice: 0, priceHistory: history2 },
      },
    };
  }

  const formatTime = ts => new Date(ts).toISOString().slice(0, 16);
  const map1 = Object.fromEntries(history1.map(d => [formatTime(d.lastUpdatedAt), d.price]));
  const map2 = Object.fromEntries(history2.map(d => [formatTime(d.lastUpdatedAt), d.price]));

  const commonTimes = Object.keys(map1).filter(t => t in map2);
  const x = commonTimes.map(t => map1[t]);
  const y = commonTimes.map(t => map2[t]);

  const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const meanX = mean(x);
  const meanY = mean(y);

  const covariance = x.reduce((sum, val, i) => sum + ((val - meanX) * (y[i] - meanY)), 0);
  const stdDev = arr => Math.sqrt(arr.reduce((sum, val) => sum + Math.pow(val - mean(arr), 2), 0));
  const stdDevX = stdDev(x);
  const stdDevY = stdDev(y);

  const correlation = stdDevX && stdDevY ? (covariance / (x.length * stdDevX * stdDevY)) : 0;

  return {
    correlation: parseFloat(correlation.toFixed(4)),
    stocks: {
      [ticker1]: { averagePrice: parseFloat(meanX.toFixed(6)), priceHistory: history1 },
      [ticker2]: { averagePrice: parseFloat(meanY.toFixed(6)), priceHistory: history2 },
    },
  };
};

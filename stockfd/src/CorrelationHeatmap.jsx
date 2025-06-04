import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import axios from "axios";

const STOCKS = ["NVDA", "AAPL", "MSFT", "GOOG", "AMZN"];

const backendUrl = "http://localhost:5000/api/stocks";

const intervals = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "50 minutes", value: 50 },
  { label: "120 minutes", value: 120 },
];

const calculateCorrelation = (x, y) => {
  const n = x.length;
  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const meanX = mean(x);
  const meanY = mean(y);
  const cov = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
  const stdDev = (arr, m) =>
    Math.sqrt(arr.reduce((sum, val) => sum + (val - m) ** 2, 0));
  const stdDevX = stdDev(x, meanX);
  const stdDevY = stdDev(y, meanY);
  if (stdDevX === 0 || stdDevY === 0) return 0;
  return cov / (stdDevX * stdDevY);
};

export default function CorrelationHeatmap() {
  const [minutes, setMinutes] = useState(50);
  const [loading, setLoading] = useState(false);
  const [correlations, setCorrelations] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  const fetchPrices = async (symbol) => {
    try {
      const res = await axios.get(`${backendUrl}/${symbol}?minutes=${minutes}`);
      if (!res.data || !Array.isArray(res.data)) return [];
      return res.data.map((item) => item.price);
    } catch {
      return [];
    }
  };

  const calculateStats = (prices) => {
    const n = prices.length;
    if (n === 0) return { avg: 0, stdDev: 0 };
    const avg = prices.reduce((a, b) => a + b, 0) / n;
    const variance =
      prices.reduce((sum, val) => sum + (val - avg) ** 2, 0) / n;
    return { avg, stdDev: Math.sqrt(variance) };
  };

  const buildCorrelationMatrix = async () => {
    setError("");
    setLoading(true);

    try {
      const pricesMap = {};
      await Promise.all(
        STOCKS.map(async (stock) => {
          pricesMap[stock] = await fetchPrices(stock);
        })
      );

      const newStats = {};
      STOCKS.forEach((stock) => {
        newStats[stock] = calculateStats(pricesMap[stock]);
      });
      setStats(newStats);

      const matrix = STOCKS.map((s1) =>
        STOCKS.map((s2) => {
          const p1 = pricesMap[s1];
          const p2 = pricesMap[s2];

          const len = Math.min(p1.length, p2.length);
          if (len === 0) return 0;

          return calculateCorrelation(p1.slice(-len), p2.slice(-len));
        })
      );
      setCorrelations(matrix);
    } catch (err) {
      setError("Failed to fetch correlation data");
    }
    setLoading(false);
  };

  useEffect(() => {
    buildCorrelationMatrix();
  }, [minutes]);

  const getColorForCorrelation = (corr) => {
    const r = corr < 0 ? 255 : Math.floor(255 * (1 - corr));
    const g = corr > 0 ? 255 : Math.floor(255 * (1 + corr));
    return `rgb(${r},${g},0)`; 
  };

  return (
    <Box maxWidth={900} mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Correlation Heatmap
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField
          select
          label="Time Interval"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          sx={{ width: 180 }}
        >
          {intervals.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          onClick={buildCorrelationMatrix}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Refresh"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {correlations.length > 0 && (
        <Box
          sx={{
            overflowX: "auto",
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 1,
            bgcolor: "#fafafa",
          }}
        >
          {/* Labels top */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `100px repeat(${STOCKS.length}, 80px)`,
              mb: 1,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            <Box></Box>
            {STOCKS.map((stock) => (
              <Tooltip
                key={"top-" + stock}
                title={
                  <>
                    <div>{stock}</div>
                    <div>
                      Avg: ₹{stats[stock]?.avg.toFixed(2) || "-"} <br />
                      StdDev: ₹{stats[stock]?.stdDev.toFixed(2) || "-"}
                    </div>
                  </>
                }
              >
                <Box
                  sx={{
                    cursor: "help",
                    textTransform: "uppercase",
                  }}
                >
                  {stock}
                </Box>
              </Tooltip>
            ))}
          </Box>

          {/* Heatmap rows */}
          {correlations.map((row, i) => (
            <Box
              key={STOCKS[i]}
              sx={{
                display: "grid",
                gridTemplateColumns: `100px repeat(${STOCKS.length}, 80px)`,
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Tooltip
                title={
                  <>
                    <div>{STOCKS[i]}</div>
                    <div>
                      Avg: ₹{stats[STOCKS[i]]?.avg.toFixed(2) || "-"} <br />
                      StdDev: ₹{stats[STOCKS[i]]?.stdDev.toFixed(2) || "-"}
                    </div>
                  </>
                }
              >
                <Box
                  sx={{
                    fontWeight: "bold",
                    cursor: "help",
                    textTransform: "uppercase",
                  }}
                >
                  {STOCKS[i]}
                </Box>
              </Tooltip>

              {row.map((val, j) => (
                <Tooltip
                  key={j}
                  title={`Correlation between ${STOCKS[i]} & ${STOCKS[j]}: ${val.toFixed(
                    3
                  )}`}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 30,
                      bgcolor: getColorForCorrelation(val),
                      borderRadius: 1,
                      cursor: "help",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "black",
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {val.toFixed(2)}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          ))}

          {/* Color Legend */}
          <Box mt={3} display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 30,
                height: 15,
                bgcolor: "rgb(255,0,0)",
                borderRadius: 1,
              }}
            />
            <Typography fontSize={12}>Strong Negative</Typography>

            <Box
              sx={{
                width: 30,
                height: 15,
                bgcolor: "rgb(255,255,0)",
                borderRadius: 1,
                mx: 1,
              }}
            />
            <Typography fontSize={12}>Neutral</Typography>

            <Box
              sx={{
                width: 30,
                height: 15,
                bgcolor: "rgb(0,255,0)",
                borderRadius: 1,
              }}
            />
            <Typography fontSize={12}>Strong Positive</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

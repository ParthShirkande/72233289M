import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Tooltip,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const backendUrl = "http://localhost:5000/api/stocks";

const intervals = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "50 minutes", value: 50 },
  { label: "120 minutes", value: 120 },
];

export default function StockPage() {
  const [ticker, setTicker] = useState("NVDA");
  const [minutes, setMinutes] = useState(50);
  const [data, setData] = useState([]);
  const [average, setAverage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStockData = async () => {
    if (!ticker) {
      setError("Please enter a ticker symbol");
      return;
    }
    if (!minutes || minutes <= 0) {
      setError("Please select a valid time interval");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/${ticker}?minutes=${minutes}`);
      if (!res.data || !Array.isArray(res.data)) {
        setError("Invalid data received");
        setLoading(false);
        return;
      }
      const priceHistory = res.data;

      // Calculate average price
      const avg =
        priceHistory.reduce((sum, item) => sum + item.price, 0) /
        priceHistory.length;

      // Format data for recharts (format time as HH:mm)
      const formattedData = priceHistory.map((entry) => ({
        time: new Date(entry.lastUpdatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: entry.price,
      }));

      setData(formattedData);
      setAverage(avg);
    } catch (err) {
      setError("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchStockData();
  }, []);

  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Stock Price Chart
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          sx={{ flex: "1 1 150px" }}
          inputProps={{ maxLength: 5 }}
        />

        <TextField
          select
          label="Time Interval"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          sx={{ flex: "1 1 150px" }}
        >
          {intervals.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={fetchStockData} disabled={loading}>
          {loading ? "Loading..." : "Fetch Data"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={["dataMin", "dataMax"]} />
            <RechartTooltip
              formatter={(value) => [`₹${value.toFixed(2)}`, "Price"]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line type="monotone" dataKey="price" stroke="#1976d2" dot />
            {/* Average Price line */}
            <ReferenceLine
              y={average}
              label={`Average ₹${average.toFixed(2)}`}
              stroke="#d32f2f"
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}

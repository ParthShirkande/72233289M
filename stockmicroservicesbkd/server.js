const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:3000", 
  })
);


app.get("/api/stocks/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const minutes = req.query.minutes || 50;

  console.log(`Fetching stock data for ${symbol} with minutes=${minutes}`);

  try {
    const response = await fetch(
      `http://20.244.56.144/evaluation-service/stocks/${symbol}?minutes=${minutes}`,
      {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5MDI0NjQ5LCJpYXQiOjE3NDkwMjQzNDksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjFmM2RmNjkyLTk5YzYtNGY0Ni1hYzJiLWNlZmI2MDM4ZGM3MSIsInN1YiI6InBhcnRoc2hpcmthbmRlOTZAZ21haWwuY29tIn0sImVtYWlsIjoicGFydGhzaGlya2FuZGU5NkBnbWFpbC5jb20iLCJuYW1lIjoicGFydGggc2hpcmthbmRlIiwicm9sbE5vIjoiNzIyMzMyODltIiwiYWNjZXNzQ29kZSI6IktSalVVVSIsImNsaWVudElEIjoiMWYzZGY2OTItOTljNi00ZjQ2LWFjMmItY2VmYjYwMzhkYzcxIiwiY2xpZW50U2VjcmV0IjoiR2VQdWV2UXd4UmZVdEFjUiJ9.BqZTdXGWcsQazTHH3i675t_z-bB3iShtYo_um6mYaTw",
        },
      }
    );
    console.log(response)

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `External API returned error for ${symbol}:`,
        response.status,
        errorBody
      );
      return res.status(response.status).json({
        error: "External API error",
        details: errorBody,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
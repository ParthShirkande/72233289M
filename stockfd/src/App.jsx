import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";

import StockPage from "./StockPage.jsx";
import CorrelationHeatmap from "./CorrelationHeatmap";

export default function App() {
  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Stock Analytics
          </Typography>
          <Button color="inherit" component={Link} to="/stock">Stock</Button>
          <Button color="inherit" component={Link} to="/correlation">Correlation Heatmap</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ marginTop: 4 }}>
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/correlation" element={<CorrelationHeatmap />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

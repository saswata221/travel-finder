import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Destination from "./pages/Destination";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="results" element={<Results />} />
          <Route path="destinations/:id" element={<Destination />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

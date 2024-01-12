/* disable linting error for ..props : */
/* eslint-disable react/jsx-props-no-spreading */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "./assets/css/main.css";

import Dashboard from "Dashboard";

// Function to dynamically load the FontAwesome kit
const loadFontAwesomeKit = () => {
  const script = document.createElement("script");
  script.src = "https://kit.fontawesome.com/47105b5a79.js";
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
};

// Call the function to load FontAwesome
loadFontAwesomeKit();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>,
);

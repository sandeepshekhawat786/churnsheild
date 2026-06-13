import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const root = document.getElementById("root");

// Prevent flash of unstyled content on load
root.style.opacity = "0";
root.style.transition = "opacity 0.35s ease";

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Fade in once React has painted
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    root.style.opacity = "1";
  });
});
// main.jsx or index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store"; // ✅ Removed curly braces
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
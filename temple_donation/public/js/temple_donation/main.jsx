import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import "./styles.css";

const root = ReactDOM.createRoot(
  document.getElementById("react-root")
);

root.render(
  <UserProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </UserProvider>
);
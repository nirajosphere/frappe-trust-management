// import React from "react";
// import ReactDOM from "react-dom/client";
// import { HashRouter } from "react-router-dom";
// import { App } from "./App";

// const root = ReactDOM.createRoot(
//   document.getElementById("react-root")
// );

// root.render(
//   <HashRouter>
//     <App />
//   </HashRouter>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

const root = ReactDOM.createRoot(
  document.getElementById("react-root")
);

root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
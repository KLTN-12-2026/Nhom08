import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import App from "./App";

import { Toaster } from "react-hot-toast";

// Khởi tạo domain mặc định là production
// Logic này sẽ được xử lý bởi domainStore khi component mount

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <div>
    <Toaster position="top-right" />
    <App />
  </div>
);

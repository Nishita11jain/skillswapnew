import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { UserContextProvider } from "./util/UserContext.jsx";

const resolvedBackendUrl = import.meta.env.VITE_BACKEND_URL;

if (!resolvedBackendUrl) {
  console.error("VITE_BACKEND_URL is required but not set. Please configure it in your environment.");
  throw new Error("Missing VITE_BACKEND_URL environment variable");
}

axios.defaults.baseURL = resolvedBackendUrl;
axios.defaults.withCredentials = true;

// Add response interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear user data
      localStorage.removeItem("userInfo");
      
      // Only redirect if not already on login page to prevent infinite loops
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <UserContextProvider>
      <App />
    </UserContextProvider>
  </Router>
);

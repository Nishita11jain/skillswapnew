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

// Extract token from URL fragment (e.g., #token=...) and persist
(() => {
  try {
    const hash = window.location.hash || "";
    if (hash.startsWith("#")) {
      const params = new URLSearchParams(hash.slice(1));
      const token = params.get("token");
      if (token && token.length > 10) {
        localStorage.setItem("authToken", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // Clean the hash from URL
        const { pathname, search } = window.location;
        window.history.replaceState(null, "", pathname + search);
      }
    }
  } catch (_) {}
})();

// Hydrate Authorization header from storage on load
(() => {
  const stored = localStorage.getItem("authToken");
  if (stored && stored.length > 10) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
  }
})();

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

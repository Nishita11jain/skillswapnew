import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { UserContextProvider } from "./util/UserContext.jsx";

const resolvedBackendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? import.meta.env.VITE_LOCALHOST : import.meta.env.VITE_SERVER_URL) ||
  "";

if (!resolvedBackendUrl) {
  console.warn("No backend URL env found. Set VITE_BACKEND_URL (or VITE_LOCALHOST/VITE_SERVER_URL). Requests will be relative.");
}

axios.defaults.baseURL = resolvedBackendUrl || axios.defaults.baseURL;
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

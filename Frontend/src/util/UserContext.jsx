import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      const userInfoString = localStorage.getItem("userInfo");
      const currentPath = location.pathname;
      
      // Don't verify token on login, register, or home pages
      const publicRoutes = ["/login", "/register", "/", "/about_us"];
      if (publicRoutes.includes(currentPath)) {
        if (userInfoString) {
          try {
            const userInfo = JSON.parse(userInfoString);
            setUser(userInfo);
          } catch (error) {
            console.error("Error parsing userInfo:", error);
            localStorage.removeItem("userInfo");
          }
        }
        setLoading(false);
        return;
      }
      
      if (!userInfoString) {
        setLoading(false);
        return;
      }

      try {
        const userInfo = JSON.parse(userInfoString);
        // Verify token by making a request to get user details
        try {
          const { data } = await axios.get("/user/registered/getDetails");
          if (data.success && data.data) {
            setUser(data.data);
            localStorage.setItem("userInfo", JSON.stringify(data.data));
          } else {
            // Invalid token, clear storage
          localStorage.removeItem("userInfo");
          setUser(null);
          }
        } catch (error) {
          // Token is invalid or expired
          console.error("Token verification failed:", error);
          localStorage.removeItem("userInfo");
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing userInfo:", error);
        localStorage.removeItem("userInfo");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();

    const handleUrlChange = () => {
      console.log("URL has changed:", window.location.href);
    };
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [navigate, location.pathname]);

  // Show minimal loading state while verifying (only if on protected route)
  const currentPath = location.pathname;
  const publicRoutes = ["/login", "/register", "/", "/about_us"];
  const isPublicRoute = publicRoutes.includes(currentPath);

  if (loading && !isPublicRoute) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        fontSize: "18px"
      }}>
        Loading...
      </div>
    );
  }

  return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
};

const useUser = () => {
  return useContext(UserContext);
};

export { UserContextProvider, useUser };

import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "./UserContext";

const PrivateRoutes = () => {
  const { user } = useUser();
  const userInfo = localStorage.getItem("userInfo");
  
  // Check both user context and localStorage for better reliability
  if (!user && !userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default PrivateRoutes;

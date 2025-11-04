import { toast } from "react-toastify";
import axios from "axios";

const ApiCall = async (url, method, navigate, setUser, data) => {
  console.log("******** Inside ApiCall function ********");

  if (method === "GET") {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error in API call:", error);
      setUser(null);
      
      // Check if error.response exists before accessing status
      if (!error.response) {
        toast.error("Network error. Please check your connection.");
        return;
      }
      
      const status = error.response.status;
      if (status === 401) {
        toast.error("You are not authorized to access this page. Please login first.");
        navigate("/login");
      } else if (status === 404) {
        toast.error("The requested resource was not found.");
        navigate("/");
      } else if (status === 500) {
        toast.error("Server Error. Please try again later.");
        navigate("/");
      } else {
        toast.error(error.response.data?.message || "An error occurred. Please try again later.");
        navigate("/");
      }
    }
  } else if (method === "POST") {
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      console.error("Error in API call:", error);
      setUser(null);
      
      // Check if error.response exists before accessing status
      if (!error.response) {
        toast.error("Network error. Please check your connection.");
        return;
      }
      
      const status = error.response.status;
      if (status === 401) {
        toast.error("You are not authorized to access this page. Please login first.");
        navigate("/login");
      } else if (status === 404) {
        toast.error("The requested resource was not found.");
        navigate("/");
      } else if (status === 500) {
        toast.error("Server Error. Please try again later.");
        navigate("/");
      } else {
        toast.error(error.response.data?.message || "An error occurred. Please try again later.");
        navigate("/");
      }
    }
  }
};

export default ApiCall;

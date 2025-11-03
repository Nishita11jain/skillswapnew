import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleGoogleLogin = () => {
    // const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const backendUrl = "https://skillswapnew.onrender.com";
    const target = backendUrl ? `${backendUrl}/auth/google` : "/auth/google";
    window.location.href = target;
  };

  const containerStyle = {
    minHeight: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #f9f9f9, #eef3ff)", // soft gradient like homepage
    padding: "20px",
  };

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "20px",
    boxShadow: "0px 8px 24px rgba(0,0,0,0.1)",
    padding: "40px 50px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "36px",
    fontWeight: "700",
    fontFamily: "Oswald, sans-serif",
    color: "#2c3e50",
    marginBottom: "20px",
  };

  const subtitleStyle = {
    fontSize: "12px",
    color: "#555",
    marginBottom: "30px",
    fontFamily: "Montserrat, sans-serif",
  };

  const buttonStyle = {
    backgroundColor: isHovered ? "#fff" : "#4e73df",
    color: isHovered ? "#4e73df" : "#fff",
    border: "2px solid #4e73df",
    fontFamily: "Montserrat, sans-serif",
    fontWeight: "600",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease-in-out",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  };

  const illustrationStyle = {
    width: "80px",
    margin: "0 auto 20px",
    display: "block",
    alignItems: "center",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img src={"/assets/images/2.png"} alt="Login" style={illustrationStyle} />
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>
          Sign in with Google to continue exploring and swapping skills with peers.
        </p>
        <Button
          style={buttonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleGoogleLogin}
        >
          <FaGoogle /> Login with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;

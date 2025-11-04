import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

// axios frontend config should not be imported on the server

const app = express();

// Default allowed origins for development (fallback if no env vars)
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Priority: FRONTEND_URL > CORS_ORIGIN > localhost defaults (dev only)
      const frontendUrl = process.env.FRONTEND_URL;
      const corsOrigin = process.env.CORS_ORIGIN;
      
      let allowed = [];
      
      // First, use FRONTEND_URL if set
      if (frontendUrl) {
        allowed.push(frontendUrl.trim());
      }
      
      // Then, add CORS_ORIGIN if set (comma-separated list)
      if (corsOrigin) {
        const corsOrigins = corsOrigin.split(",").map((o) => o.trim()).filter(Boolean);
        allowed = [...new Set([...allowed, ...corsOrigins])];
      }

      // In development, add localhost origins if no env vars are set
      const isDevelopment = process.env.NODE_ENV !== "production";
      if (isDevelopment && allowed.length === 0) {
        allowed = defaultDevOrigins;
      } else if (isDevelopment) {
        // Merge with localhost in dev even if env vars are set
        allowed = [...new Set([...allowed, ...defaultDevOrigins])];
      }

      if (allowed.length === 0 || allowed.includes(origin)) {
        return callback(null, true);
      }

      // Log for debugging
      console.log(`CORS blocked origin: ${origin}. Allowed: ${allowed.join(", ")}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // to parse json in body
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // to parse url
app.use(express.static("public")); // to use static public folder
app.use(cookieParser()); // to enable CRUD operation on browser cookies

// Additional CORS headers middleware (backup)
app.use(function (req, res, next) {
  // Priority: FRONTEND_URL > CORS_ORIGIN > localhost defaults (dev only)
  const frontendUrl = process.env.FRONTEND_URL;
  const corsOrigin = process.env.CORS_ORIGIN;
  
  let allowed = [];
  
  if (frontendUrl) {
    allowed.push(frontendUrl.trim());
  }
  
  if (corsOrigin) {
    const corsOrigins = corsOrigin.split(",").map((o) => o.trim()).filter(Boolean);
    allowed = [...new Set([...allowed, ...corsOrigins])];
  }
  
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (isDevelopment && allowed.length === 0) {
    allowed = defaultDevOrigins;
  } else if (isDevelopment) {
    allowed = [...new Set([...allowed, ...defaultDevOrigins])];
  }

  const requestOrigin = req.headers.origin;
  if (requestOrigin && (allowed.length === 0 || allowed.includes(requestOrigin))) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS only)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Required for cross-site cookies in production
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Importing routes
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import requestRouter from "./routes/request.routes.js";
import reportRouter from "./routes/report.routes.js";
import ratingRouter from "./routes/rating.routes.js";

// Using routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/report", reportRouter);
app.use("/rating", ratingRouter);

// Health and root routes
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.status(200).json({
    name: "SkillSwap Backend",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

export { app };
export default app;

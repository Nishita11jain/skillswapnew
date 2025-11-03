import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
// axios frontend config should not be imported on the server


const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()).filter(Boolean)
        || (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []);
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // to parse json in body
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // to parse url
app.use(express.static("public")); // to use static public folder
app.use(cookieParser()); // to enable CRUD operation on browser cookies

app.use(function (req, res, next) {
  const allowed = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()).filter(Boolean)
    || (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []);
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowed.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
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

import dotenv from "dotenv";
dotenv.config();

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

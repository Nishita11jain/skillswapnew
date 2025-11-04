import { generateJWTToken_email, generateJWTToken_username } from "../utils/generateJWTToken.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

dotenv.config();

// Initialize Google OAuth only when required env vars are present to avoid runtime errors
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );
} else {
  console.warn("Google OAuth env vars not set; skipping GoogleStrategy initialization");
}

// Passport serialization functions (required for sessions)
passport.serializeUser((user, done) => {
  // Serialize the user profile to the session
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // Deserialize the user from the session
  done(null, user);
});

export const googleAuthHandler = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : undefined,
  session: false,
});

export const handleGoogleLoginCallback = asyncHandler(async (req, res) => {
  console.log("\n******** Inside handleGoogleLoginCallback function ********");
  // console.log("User Google Info", req.user);

  const existingUser = await User.findOne({ email: req.user._json.email });

  const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
  if (!frontendBase) {
    return res.status(500).json(new ApiError(500, "FRONTEND_URL is not configured on the server"));
  }

  const isProduction = process.env.NODE_ENV === "production";
  const crossSite = process.env.CROSS_SITE_COOKIES === "true";
  const cookieOptions = {
    httpOnly: true,
    secure: crossSite || isProduction,
    sameSite: "none",
    path: "/",
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };

  if (existingUser) {
    const jwtToken = generateJWTToken_username(existingUser);
    const expiryDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
    res.cookie("accessToken", jwtToken, { ...cookieOptions, expires: expiryDate });
    // Also pass token via URL fragment to avoid third-party cookie issues
    return res.redirect(`${frontendBase}/discover#token=${jwtToken}`);
  }

  let unregisteredUser = await UnRegisteredUser.findOne({ email: req.user._json.email });
  if (!unregisteredUser) {
    console.log("Creating new Unregistered User");
    unregisteredUser = await UnRegisteredUser.create({
      name: req.user._json.name,
      email: req.user._json.email,
      picture: req.user._json.picture,
    });
  }
  const jwtToken = generateJWTToken_email(unregisteredUser);
  const expiryDate = new Date(Date.now() + 0.5 * 60 * 60 * 1000);
  res.cookie("accessTokenRegistration", jwtToken, { ...cookieOptions, expires: expiryDate });
  // Also pass token via URL fragment to avoid third-party cookie issues
  return res.redirect(`${frontendBase}/register#token=${jwtToken}`);
});

export const handleLogout = (req, res) => {
  console.log("\n******** Inside handleLogout function ********");
  const isProduction = process.env.NODE_ENV === "production";
  const crossSite = process.env.CROSS_SITE_COOKIES === "true";
  const cookieOptions = {
    httpOnly: true,
    secure: crossSite || isProduction,
    sameSite: "none",
    path: "/",
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("accessTokenRegistration", cookieOptions);
  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
};

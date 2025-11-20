// middleware/auth.js
import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import User from "../models/user.js";

// Public routes (no JWT required)
const publicPaths = [
  "/",
  "/api/health",
];

// JWT Validation Middleware
export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
}).unless({ path: publicPaths });

// Sync Auth0 user → MongoDB + attach user to req
export const getUserFromToken = async (req, res, next) => {
  try {
    const payload = req.auth;
    const namespace = `${process.env.CLIENT_URL}`; // Change to your domain in prod

    // === Extract claims from JWT ===
    const email = (payload[`${namespace}/email`] || payload.email)?.toLowerCase();
    const name = payload[`${namespace}/name`] || payload.name || payload.nickname || email;
    const picture = payload[`${namespace}/picture`] || payload.picture;
    const roles = payload[`${namespace}/roles`] || [];
    const auth0Id = payload.sub;

    // === Determine userType: Token → Roles → Email fallback ===
    let userType = payload[`${namespace}/userType`] || "user"; // Priority 1: from Auth0 Action

    // Priority 2: from roles (if using Auth0 RBAC)
    if (userType !== "admin" && roles.includes("admin")) {
      userType = "admin";
    }

    // Priority 3: fallback to ADMIN_EMAILS (for legacy or safety)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
    if (userType !== "admin" && email && adminEmails.includes(email)) {
      userType = "admin";
    }

    // === Find or create user in MongoDB ===
    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = new User({
        auth0Id,
        email,
        name,
        picture,
        userType,
      });
      await user.save();
    } else if (user.userType !== userType) {
      // Update if changed (e.g. admin status granted)
      user.userType = userType;
      user.email = email || user.email;
      user.name = name || user.name;
      user.picture = picture || user.picture;
      await user.save();
    }

    // Attach full user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
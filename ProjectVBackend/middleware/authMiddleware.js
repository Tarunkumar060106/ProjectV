const jwt = require("jsonwebtoken");
require("dotenv").config();
const Blacklist = require("../models/Blacklist");

const authMiddleware = (roles = []) => async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.header("Authorization");

    // Check if the token exists
    if (!token) {
      return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    // Remove the "Bearer " prefix from the token
    const cleanToken = token.replace("Bearer ", "");

    // Check if the token is blacklisted
    const blacklistedToken = await Blacklist.findOne({ token: cleanToken });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Token is invalid. Please log in again." });
    }

    // Verify the token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    // Attach the user information to the request object
    req.user = decoded;

    // Check if the user's role is allowed
    if (roles.length > 0 && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("❌ Error in Auth Middleware:", error);
    return res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleware;
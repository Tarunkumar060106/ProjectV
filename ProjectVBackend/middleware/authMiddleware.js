const jwt = require("jsonwebtoken");
require("dotenv").config();
const Blacklist = require("../models/Blacklist");

const authMiddleware = (roles = []) => async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

    try {
        const BlackListed = await Blacklist.findOne({ token: token.replace( token )})
        if(BlackListed) return res.status(401).json({ message: "Token is invalid. Please Log In again."})
        
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;

        if (roles.length && !roles.includes(decoded.role)) {
            return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
        }


        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;

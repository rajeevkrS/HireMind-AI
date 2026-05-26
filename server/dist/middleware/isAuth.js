// This code creates an authentication middleware in Express.js using JSON Web Token
import jwt from "jsonwebtoken";
import User from "../models/User.js";
// Creates authentication middleware
export const isAuth = async (req, // Incoming request
res, // Response sender
next) => {
    try {
        // Get Authorization Header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(401).json({
                message: "Please Login- No auth header",
            });
            return;
        }
        // Extract Token- eg: Bearer abc123
        // -split()- ["Bearer", "abc123"]
        // -[1]- abc123
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Please Login- Token missing!",
            });
            return;
        }
        // Verify JWT Token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedData || !decodedData._id) {
            res.status(401).json({
                message: "Invalid Token!",
            });
            return;
        }
        // Find User
        const user = await User.findById(decodedData._id);
        if (!user) {
            res.status(401).json({
                message: "Token expired!",
            });
            return;
        }
        // Attach User to Request
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Please Login",
        });
    }
};

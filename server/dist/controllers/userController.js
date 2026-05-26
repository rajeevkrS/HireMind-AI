import axios from "axios";
import { oauth2client } from "../config/googleconfig.js";
import { TryCatch } from "../middleware/trycatch.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
// API for User Login
export const loginUser = TryCatch(async (req, res) => {
    //Get Authorization Code- Frontend sends Google authorization code
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ message: "Authorization code is require" });
    }
    // Sends code to Google and returns -access token -refresh token -ID token
    const googleRes = await oauth2client.getToken(code);
    // Stores Google tokens inside OAuth client, Now client becomes authenticated
    oauth2client.setCredentials(googleRes.tokens);
    // Get Google User Info
    const userRes = await axios.get(
    // Google endpoint for user profile
    // access_token- Proves user is authenticated
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
    // Extract User Data
    const { email, name, picture } = userRes.data;
    // Check Existing User
    let user = await User.findOne({ email });
    // Create New User If Needed
    if (!user) {
        user = await User.create({
            name,
            email,
            image: picture,
        });
    }
    // Create JWT/Login Token
    // { _id: user._id } Payload- Stores user ID inside token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    res.json({
        message: "User Logged In",
        token,
        user,
    });
});
// API to get User Profile
export const getProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});

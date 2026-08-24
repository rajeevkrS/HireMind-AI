import { TryCatch } from "../middleware/trycatch.js";
import User from "../models/User.js";
import { instance } from "../server.js";
import crypto from "crypto";
// Creating the checkout controller
export const checkout = TryCatch(async (req, res) => {
    const user_id = req.user?._id;
    if (!user_id) {
        return res.status(400).json({
            message: "No User Id",
        });
    }
    // Finding the user
    const user = await User.findById(user_id);
    // Checking the subscription expiry
    // Converting the subscription date into a timestamp
    const subTime = user?.subscription
        ? new Date(user.subscription).getTime()
        : 0;
    const now = Date.now();
    // Checking if the subscription is still active
    const isSubscribed = subTime > now;
    // Preventing another purchase
    if (isSubscribed) {
        return res.status(400).json({
            message: "User already subscribed",
        });
    }
    // Getting subscription duration
    const { duration } = req.body;
    // Calculating the payment amount
    let amount;
    // if duration is for 1 month else 6 months
    if (duration === 1) {
        amount = Number(299 * 100);
    }
    else {
        amount = Number(1499 * 100);
    }
    // Creating Razorpay order options
    const options = {
        amount,
        currency: "INR",
        notes: {
            user_id: user_id?.toString(),
            duration: duration.toString(),
        },
    };
    // Creating the Razorpay order
    const order = await instance.orders.create(options);
    res.status(201).json({
        order,
    });
});
// Verification Payment
export const paymentVerification = TryCatch(async (req, res) => {
    const user = req.user;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
});

import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { TryCatch } from "../middleware/trycatch.js";
import User from "../models/User.js";
import { instance } from "../server.js";
import crypto from "crypto";

// Creating the checkout controller
export const checkout = TryCatch(async (req: AuthenticatedRequest, res) => {
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
  } else {
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
export const paymentVerification = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    // Get Razorpay's payment information
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Create the verification string
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Generate your own signature
    // createHmac → creates HMAC algorithm using SHA-256 with Razorpay secret key
    // update → gives it the order_id + payment_id (body) to generate the signature from
    // digest→ converts the generated signature into a hexadecimal string
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest("hex");

    // Compare signatures
    const isAuthentic = expectedSignature === razorpay_signature;

    // If payment is authentic-> Fetch the Razorpay order
    if (isAuthentic) {
      const order = await instance.orders.fetch(razorpay_order_id);

      const duration = Number(order.notes?.duration);

      const now = new Date();

      let expiryDate;

      // + day + hr + min + sec + millisec
      if (duration === 1) {
        expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        expiryDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      }

      // Update the user's subscription
      const updatedUser = await User.findByIdAndUpdate(
        user?._id,
        { subscription: expiryDate },
        { new: true },
      );

      res.json({
        message: "Subscription Purchased Successfully",
        updatedUser,
      });
    } else {
      return res.status(400).json({
        message: "Payment Failed!",
      });
    }
  },
);

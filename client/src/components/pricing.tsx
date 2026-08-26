import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { plans } from "../utils";
import { useState } from "react";
import { CheckCircle, Shield } from "lucide-react";
import { backendUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function StatusBadge() {
  const { isAuth, user } = useAppData();

  if (!isAuth) return null;

  const isPro = user?.subscription && new Date() < new Date(user.subscription);

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${isPro ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/50"}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${isPro ? "bg-emerald-400" : "bg-white/30"}`}
      />

      {isPro
        ? `Pro Active • expires ${new Date(
            user!.subscription!,
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}`
        : "You'er on the Free Plan • 3 requests included"}
    </div>
  );
}

// Function receives plan and highlight
function PlanCTA({
  plan,
  highlight,
}: {
  plan: (typeof plans)[0];
  highlight: boolean;
}) {
  // Get authentication/user information
  const { isAuth, user, setUser } = useAppData();

  // Check whether the user currently has Pro
  const isPro =
    isAuth && user?.subscription && new Date() < new Date(user.subscription);

  if (isAuth) {
    if (plan.name === "Free") {
      return (
        <p className="mt-auto text-center text-xs text-white/40 py-3">
          {isPro ? "Your previous plan" : "✓ Currently active"}
        </p>
      );
    }

    if (isPro) {
      return (
        <p className="mt-auto text-center text-xs text-white/30 py-3">
          ✓ Already subscribed
        </p>
      );
    }
  }

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // This function runs when the user clicks Subscribe
  const handleSubscribe = async (price: any) => {
    // User is not logged in
    if (!isAuth) {
      navigate("/login");
      return;
    }

    // Get authentication token
    const token = localStorage.getItem("token");

    setLoading(true);

    let duration;

    if (price === "₹299") {
      duration = 1;
    } else {
      duration = 6;
    }

    // Calling checkout api from backend
    const {
      data: { order },
    } = await axios.post(
      `${backendUrl}/api/payment/checkout`,
      { duration },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Create Razorpay options
    // This object tells Razorpay how the payment window should behave
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "HIREMind AI",
      description: "Land Your Dream Job",
      order_id: order.id,
      method: {
        card: true,
        netbanking: true,
        wallet: false,
        upi: false,
        emi: false,
        paylater: false,
      },

      // This function runs after Razorpay successfully completes the payment
      handler: async function (response: any) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
          response;

        try {
          // Sends payment details to backend
          const { data } = await axios.post(
            `${backendUrl}/api/payment/verify`,
            {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          toast.success(data.message);
          setUser(data.updatedUser); // update user profile
          navigate("/account");
          setLoading(false);
        } catch (error: any) {
          setLoading(false);
          toast.error(error.response.data.message);
        }
      },
      theme: {
        color: "#F327254",
      },
    };

    // Create Razorpay object and Open payment window
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <button
      className={`mt-auto text-center text-sm font-semibold py-3 rounded-xl transition-all duration-200 ${
        highlight
          ? "btn-primary"
          : "bg-white/6 hover:bg-white/10 border border-white/10 text-white cursor-pointer"
      }`}
      onClick={() => handleSubscribe(plan.price)}
      disabled={loading}
    >
      {loading ? "Please wait..." : plan.cta}
    </button>
  );
}

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="feature-pill inline-flex mb-4">
          <Shield size={11} className="text-emerald-400" /> Simple Pricing
        </span>

        <h2
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Start free. Upgrade <span className="text-gradient">when ready.</span>
        </h2>

        <p className="text-white/40 mt-4 max-w-md mx-auto">
          Your first 3 requests are completely free - no card needed.
        </p>

        <div className="flex justify-center mt-6">
          <StatusBadge />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-center">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass-card p-8 flex flex-col gap-6 relative transition-all duration-300 ${
              plan.highlight
                ? "border-indigo-500/10 shadow-2xl shadow-indigo-500/10 scale-[1.02]"
                : "hover:border-white/14"
            }`}
          >
            {plan.badge && (
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  plan.highlight
                    ? "bg-linear-to-r from-indigo-500 to-emerald-400 text-white"
                    : "bg-white/30 text-white/70"
                }`}
              >
                {plan.badge}
              </span>
            )}

            <div className="">
              <p className="text-xs text-white/35 uppercase tracking-widest mb-1">
                {plan.name}
              </p>

              <div className="flex items-end gap-1">
                <span
                  className="text-4xl font-black"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {plan.price}
                </span>

                {plan.period && (
                  <span className="text-white/35 text-sm mb-1">
                    {plan.period}
                  </span>
                )}
              </div>

              <p className="text-white/40 text-sm mt-1">{plan.desc}</p>
            </div>

            <div className="divider-subtle" />

            <ul className="flex flex-col gap-3">
              {plan.features.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-white/60"
                >
                  <CheckCircle
                    size={14}
                    className="text-emerald-400 shrink-0 mt-0.5"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <PlanCTA plan={plan} highlight={plan.highlight} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;

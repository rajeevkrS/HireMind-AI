import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { backendUrl } from "../App";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { features } from "../utils";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const handleGoogleLogin = async (authResult: any) => {
    setLoading(true);

    try {
      const result = await axios.post(`${backendUrl}/api/user/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);

      setUser(result.data.user);
      setIsAuth(true);

      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Login Failed!");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: handleGoogleLogin,
    flow: "auth-code",
  });

  return (
    <div className="bg-page flex items-center justify-center p-4">
      {/* Glowing Orbit Balls */}
      <div className="orb w-96 h-96 bg-indigo-500 -top-20 -left-20" />

      <div className="orb w-80 h-80 bg-emerald-500 bottom-10 right-0" />

      <div className="orb w-64 h-64 bg-violet-600 top-1/2 left-1/2 -translate-x-1/2" />

      {/* Glass Card */}
      <div className="glass-card w-full max-w-md p-10 flex flex-col items-center gap-8 z-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src="/hiremind-logo.png"
            alt="HIREMind Logo"
            className="w-14 object-contain hidden sm:block"
          />

          <img
            src="/hiremind-brand.png"
            alt="HIREMind AI"
            className="h-15 object-contain"
          />

          <p className="text-white/40 text-sm leading-relaxed text-gradient">
            Your AI-Powerd co-poilet - build, analyse, and land your next role.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-2">
          {features.map(({ icon: Icon, label }) => (
            <span key={label} className="feature-pill">
              <Icon size={14} className="text-indigo-400" />
              {label}
            </span>
          ))}
        </div>

        <div className="divider-subtle"></div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-center text-xs text-white/30 uppercase tracking-widest font-medium">
            Continue with
          </p>

          <button
            className="btn-google"
            onClick={googleLogin}
            disabled={loading}
          >
            {loading ? (
              <p className="text-gray-400 animate-pulse">Please Wait...</p>
            ) : (
              <>
                <img src="/google.svg" alt="" className="w-4 h-4" /> Sign with
                Google
              </>
            )}
          </button>
        </div>

        <div className="text-[11px] text-white/45 text-center leading-relaxed">
          By singning in you agree to out{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:text-white/70 transition-colors"
          >
            Terms{" "}
          </a>
          {"&"}{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:text-white/70 transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;

import {
  ArrowRight,
  ChevronRight,
  Zap,
  Sparkles,
  AlertTriangle,
  BriefcaseBusiness,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppData } from "../context/AppContext";

function Hero() {
  const { isAuth } = useAppData();

  return (
    <section className="relative pt-36 pb-28 px-6 flex flex-col items-center text-center overflow-hidden">
      <div
        className="orb w-150 h-150 bg-indigo-600 -top-40 left-1/2 -translate-x-1/2"
        style={{ opacity: 0.12 }}
      />

      {/* <div
        className="orb w-80 h-80 bg-emerald-500 bottom-0 right-10"
        style={{ opacity: 0.1 }}
      /> */}

      <div className="inline-flex items-center gap-2 feature-pill mb-6 animate-fade-in">
        <Zap size={11} className="text-emerald-400" />
        <span>AI-Powered Career Platform</span>
      </div>

      <h1
        className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight max-w-4xl mb-6 animate-slide-up"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        Land Your Dream Job
        <br />
        <span className="text-gradient">Faster with AI</span>
      </h1>

      <p
        className="text-white/45 text-lg md:text-xl max-w-xl leading-relaxed mb-10 animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        Analyse your resume, get an ATS score, discover the right jobs, build a
        stunning resume, and ace every interview- all in one place.
      </p>

      <div
        className="flex flex-col sm:flex-row items-center gap-3 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <Link
          to={isAuth ? "/jobmatcher" : "/login"}
          className="btn-primary px-7 py-3.5 rounded-xl text-base font-semibold"
        >
          {isAuth ? (
            <p className="flex items-center gap-2">
              Find Best Jobs <ArrowRight size={16} />
            </p>
          ) : (
            <p className="flex items-center gap-2">
              Start for free <ArrowRight size={16} />{" "}
            </p>
          )}
        </Link>

        <a
          href="#features"
          className="text-sm text-white/45 hover:text-white transition-colors flex items-center gap-1.5"
        >
          See how it works <ChevronRight size={14} />
        </a>
      </div>

      <p className="text-white/45 text-xs mt-6">
        First 3 analyses free • No credit card required
      </p>

      <div
        className="mt-16 glass-card px-6 py-6 flex items-center gap-6 animate-slide-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="flex flex-col items-center">
          <span
            className="text-4xl font-black text-gradient"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            87
          </span>
          <span className="text-[10px] font-black text-gradient text-white/35 uppercase tracking-widest">
            ATS Score
          </span>
        </div>

        <div className="h-10 w-px bg-white/10" />

        <div className="flex flex-col gap-2 text-left">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <Sparkles size={13} />
            <span>Strong keywords detected</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-yellow-400">
            <AlertTriangle size={13} />
            <span>Missing: quantified impact</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-white/50">
            <BriefcaseBusiness size={13} />
            <span>3 Job matches found</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

import { useRef, useState } from "react";
import type { Analysis } from "../types";
import {
  downloadReport,
  prioBg,
  prioColor,
  scoreBar,
  scoreColor,
  toBase64,
} from "../utils";
import axios from "axios";
import { backendUrl } from "../App";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  Loader2,
  Upload,
} from "lucide-react";
import { ScoreRing } from "../ring";

const AnalysePage = () => {
  // Stores AI response
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Points to hide file input
  const fileRef = useRef<HTMLInputElement>(null);

  // Handle File function
  async function handleFile(file: File) {
    // Check PDF - resume.pdf
    // Blocks: resume.docx, resume.png, resume.jpg
    if (file.type !== "application/pdf") {
      return setError("Please upload a PDF file.");
    }

    // Check Size - 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return setError("File size should be less than 5MB.");
    }

    // Reset UI before starting analysis
    setError("");
    setLoading(true);
    setResult(null);

    try {
      // Convert PDF to Base64
      // Converts: resume.pdf -> data:application/pdf;base64,JVBERi...
      const pdfBase64 = await toBase64(file);

      // Send to Backend
      const { data } = await axios.post(
        `${backendUrl}/api/ai/analyse`,
        { pdfBase64 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      // Save Response - Stores Gemini analysis
      setResult(data);
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 503) {
        setError(
          "AI analysis is temporarily unavailable due to high demand. Please try again in a few minutes.",
        );
      } else if (status === 403) {
        setError(message || "Upgrade your plan to continue.");
      } else if (status === 400) {
        setError(message || "Invalid resume file.");
      } else {
        setError(
          message ||
            "We couldn't analyse your resume right now. Please try again later.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // Drag & Drop
  const onDrop = (e: React.DragEvent) => {
    // Prevent browser opening PDF
    e.preventDefault();

    // Get file
    const f = e.dataTransfer.files[0];

    // Analyse
    if (f) handleFile(f);
  };

  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {/* Upload Area */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="glass-card border-dashed border-white/15 flex flex-col items-center justify-center gap-3 py-10
          cursor-pointer hover:border-indigo-500/40 hover:bg-white/2 transition-all duration-300 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload size={32} className="text-indigo-400" />
          </div>

          <div className="text-center">
            <p className="font-semibold text-white/80">
              {result ? "Analyse another resume" : "Drop your resume here"}
            </p>

            <p className="text-white/35 text-sm mt-0.5">
              or click to browse • PDFonly • max 5MB
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>

        {/* Hidden Input */}
        <input
          type="file"
          ref={fileRef}
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];

            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />

            <p className="text-white/40 text-sm">Analysing your resume...</p>
          </div>
        )}

        {/* ------Result Section------- */}
        {result && !loading && (
          <>
            <div className="glass-card p-6 flex items-center gap-6 flex-wrap">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={result.atsScore} />

                <div className="absolute flex flex-col items-center">
                  <span
                    className={`text-2xl font-black ${scoreColor(result.atsScore)}`}
                  >
                    {result.atsScore}
                  </span>

                  <span className="text-[10px] text-white/30">ATS</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold mb-1">Overall Score</p>
                <p className="text-white/45 text-sm leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  Score Breakdown
                </p>

                {Object.entries(result.scoreBreakdown).map(([key, val]) => (
                  <div className="flex flex-col gap-1.5" key={key}>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60 capitalize">{key}</span>

                      <span
                        className={`font-semibold ${scoreColor(val.score)}`}
                      >
                        {val.score}
                      </span>
                    </div>

                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-linear-to-r ${scoreBar(val.score)} rounded-full transition-all duration-700`}
                        style={{ width: `${val.score}%` }}
                      />
                    </div>

                    <p className="text-xs text-white/35">{val.feedback}</p>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              <div className="glass-card p-6 flex flex-col gap-3">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  Strenghts
                </p>

                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/60"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-emerald-400 shrink-0 mt-0.5"
                    />{" "}
                    {s}
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <p className="text-xs text-white/30 uppercase tracking-widest">
                  Suggestions
                </p>

                {result.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col gap-2 ${prioBg[s.priority]}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white/80">
                        {s.category}
                      </span>

                      <span
                        className={`text-[11px] font-bold uppercase tracking-widest ${prioColor[s.priority]}`}
                      >
                        {s.priority}
                      </span>
                    </div>

                    <p className="text-sm text-white/50">{s.issue}</p>

                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <ChevronRight
                        size={14}
                        className="shrink-0 mt-0.5 text-indigo-400/"
                      />
                      {s.recommendation}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => downloadReport(result)}
                  className="btn-primary flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold"
                >
                  <Download size={16} />
                  Download Report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysePage;

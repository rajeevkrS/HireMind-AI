import { useRef, useState } from "react";
import type { InterviewData, Question } from "../types";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  Download,
  FileText,
  Lightbulb,
  Loader2,
  Upload,
  Users,
} from "lucide-react";
import { backendUrl } from "../App";
import axios from "axios";
import { downloadInterview, toBase64 } from "../utils";

// Question Card Component
function QCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full items-start justify-between gap-4 py-4 px-5 text-left hover:bg-white/2 transition-colors"
      >
        <div className="flex gap-3 items-start">
          <span className="text-xs font-bold text-indigo-400 mt-0.5">
            Q{q.id}
          </span>

          <div>
            <p className="text-sm text-white/80 leading-relaxed">
              {q.question}
            </p>

            <span className="text-[10px] text-white/25 uppercase tracking-widest mt-1 block">
              {q.category}
            </span>
          </div>
        </div>

        {open ? (
          <ChevronUp size={14} className="text-white/30 shrink-0 mt-1" />
        ) : (
          <ChevronDown size={14} className="text-white/30 shrink-0 mt-1" />
        )}

        {open && (
          <div className="px-5 pb-4 flex items-start gap-2 border-t border-white/6 pt-3">
            <Lightbulb size={13} className="text-amber-400 shrink-0 mt-0.5" />{" "}
            <p className="text-xs text-white/45 leading-relaxed">{q.hint}</p>
          </div>
        )}
      </button>
    </div>
  );
}

const InterviewPrep = () => {
  const [mode, setMode] = useState<"manual" | "resume">("manual");
  const [round, setRound] = useState<"hr" | "technical">("hr");
  const [skills, setSkills] = useState<string>("");
  const [result, setResult] = useState<InterviewData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [experience, setExperience] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  // Handle File function
  // Runs when user uploads resume
  async function handleFileChange(f: File) {
    // Check PDF - resume.pdf
    if (f.type !== "application/pdf") {
      return setError("Please upload a PDF file.");
    }

    if (f.size > 5 * 1024 * 1024) {
      return setError("File size should be less than 5MB.");
    }

    setError("");

    setUploadingFile(true);

    // fake upload animation
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setFile(f);

    setUploadingFile(false);
  }

  // Handle Submit function
  async function handleSubmit() {
    setError("");
    setResult(null);

    // Manual Validation
    if (mode === "manual" && (!skills.length || !experience.trim())) {
      return setError("Please add at least one skill and your experience.");
    }

    // Resume Validation
    if (mode === "resume" && !file) {
      return setError("Please upload your resume.");
    }

    // Displays spinner
    setLoading(true);
    try {
      // Create a payload object
      let payload: any = { mode, round };

      if (mode === "manual") {
        payload.skills = skills;
        payload.experience = experience;
      } else {
        payload.pdfBase64 = await toBase64(file!);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/ai/interview`,
        payload,
        {
          headers: {
            // Sends JWT token
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setResult(data);
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 503) {
        setError(
          "Interview Prep AI is temporarily unavailable due to high demand. Please try again in a few minutes.",
        );
      } else if (status === 403) {
        setError(message || "Upgrade your plan to continue.");
      } else if (status === 400) {
        setError(
          message ||
            "Unable to process your request. Please check your inputs and try again.",
        );
      } else {
        setError(
          message ||
            "We couldn't generate interview questions right now. Please try again later.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {/* Add Section */}
        <div className="glass-card p-1.5 flex gap-1.5">
          {(["manual", "resume"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResult(null);
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                mode === m
                  ? "btn-primary"
                  : "text-white/40 hover:text-white/70 cursor-pointer"
              }`}
            >
              {m === "manual" ? "Enter Skills Manually" : "Upload Resume"}
            </button>
          ))}
        </div>

        {/* Add Section */}
        <div className="glass-card p-1.5 flex gap-1.5">
          {(
            [
              { key: "hr", lable: "HR Round", Icon: Users },
              { key: "technical", lable: "Technical Round", Icon: Code2 },
            ] as const
          ).map(({ key, lable, Icon }) => (
            <button
              key={key}
              onClick={() => {
                setRound(key);
                setResult(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                round === key
                  ? "btn-primary"
                  : "text-white/40 hover:text-white/70 cursor-pointer"
              }`}
            >
              <Icon size={14} /> {lable}
            </button>
          ))}
        </div>

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="glass-card p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/30 uppercase tracking-widest">
                Your Skills
              </label>

              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Python, SQL..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/30 uppercase tracking-widest">
                Experience & Background
              </label>

              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={4}
                placeholder="e.g. 2 Years of frontend development, worked on e-commerce projects, familier with agile teams..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-white/25 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Resume File Mode */}
        {mode === "resume" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFileChange(f);
            }}
            onClick={() => fileRef.current?.click()}
            className="glass-card border-dashed border-white/15 flex flex-col items-center justify-center gap-3 py-10
            cursor-pointer hover:border-indigo-500/40 hover:bg-white/2 transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              {uploadingFile ? (
                <Loader2 size={32} className="text-indigo-400 animate-spin" />
              ) : file ? (
                <FileText size={32} className="text-red-400" />
              ) : (
                <Upload size={32} className="text-indigo-400" />
              )}
            </div>

            <div className="text-center w-full px-6">
              <p className="font-semibold text-white/80">
                Drop your resume here
              </p>

              {!file && !uploadingFile && (
                <p className="text-white/35 text-sm mt-0.5">
                  or click to browse • PDF only • max 5MB
                </p>
              )}

              {uploadingFile && (
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-white/60">
                  <Loader2 size={16} className="animate-spin text-indigo-400" />
                  Uploading resume...
                </div>
              )}

              {file && !uploadingFile && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <FileText size={18} className="text-red-400" />

                  <span className="text-sm text-white/70 truncate max-w-62.5">
                    {file.name}
                  </span>
                </div>
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

                if (f) handleFileChange(f);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1.5">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {!loading && (
          <button
            onClick={handleSubmit}
            className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Code2 size={16} /> Get Interview Questions
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">
              Getting Interview Questions...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-4">
            <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-white">{result.role}</p>
                <p className="text-white/40 text-sm mt-0.5">
                  {result.round === "hr" ? "HR Round" : "Technical Round"} •{" "}
                  {result.questions.length} questions
                </p>
              </div>

              <button
                onClick={() => downloadInterview(result)}
                className="feature-pill gap-2 cursor-pointer hover:border-white/20 transition-colors"
              >
                <Download size={11} /> Download PDF
              </button>
            </div>

            {result.questions.map((q) => (
              <QCard key={q.id} q={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;

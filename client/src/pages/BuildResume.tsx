import { useRef, useState } from "react";
import type { Education, Experience, Project, ResumeData } from "../types";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
  Plus,
  Trash,
  Upload,
} from "lucide-react";
import { generateResumePDF, toBase64 } from "../utils";
import { backendUrl } from "../App";
import axios from "axios";

const blankExp = (): Experience => ({
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  bullets: [""],
});

const blankEdu = (): Education => ({
  degree: "",
  college: "",
  location: "",
  year: "",
  gpa: "",
});

const blankProj = (): Project => ({
  name: "",
  description: "",
  link: "",
});

const Field = ({ label, value, onChange, placeholder, textarea }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/30 uppercase tracking-widest">
      {label}
    </label>

    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="input-field resize-node"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field resize-node"
      />
    )}
  </div>
);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <span className="text-sm font-semibold text-white/80">{title}</span>

        {open ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>

      {open && <div className="px-6 pb-6 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

const BuildResume = () => {
  const [mode, setMode] = useState<"manual" | "improve">("manual");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const [basics, setBasics] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  });

  const [summary, setSummary] = useState("");

  const [experience, setExperience] = useState<Experience[]>([blankExp()]);
  const [education, setEducation] = useState<Education[]>([blankEdu()]);
  const [techSkills, setTechSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [projects, setProjects] = useState<Project[]>([blankProj()]);
  const [certificates, setCertificates] = useState("");

  function updateExp(i: number, key: keyof Experience, val: any) {
    setExperience((p) =>
      p.map((e, idx) => (idx === i ? { ...e, [key]: val } : e)),
    );
  }

  function updateBullet(ei: number, bi: number, val: string) {
    setExperience((p) =>
      p.map((e, i) =>
        i === ei
          ? { ...e, bullets: e.bullets.map((b, j) => (j === bi ? val : b)) }
          : e,
      ),
    );
  }

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

  async function handleSubmit() {
    setError("");
    setResult(null);

    // Resume Validation
    if (mode === "improve" && !file) {
      return setError("Please upload your resume.");
    }

    // Manual Validation
    if (mode === "manual" && !basics.name.trim()) {
      return setError("Please enter your name.");
    }

    setLoading(true);

    try {
      let payload: any = { mode };

      if (mode === "manual") {
        payload.formData = {
          ...basics,
          summary,
          experience,
          education,
          skills: {
            technical: techSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            soft: softSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          projects,
          certifications: certificates
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
      } else {
        payload.pdfBase64 = await toBase64(file!);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/ai/resume-build`,
        payload,
        {
          headers: {
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
          "Resume Builder is temporarily unavailable due to high demand. Please try again in a few minutes.",
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
            "We couldn't build resume right now. Please try again later.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Add Section */}
        <div className="glass-card p-1.5 flex gap-1.5">
          {(["manual", "improve"] as const).map((m) => (
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
              {m === "manual"
                ? "Build From Scratch"
                : "Improve Existing Resume"}
            </button>
          ))}
        </div>

        {mode == "manual" && (
          <>
            {/* Personal Detail */}
            <Section title="Personal Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name"
                  value={basics.name}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, name: v }))
                  }
                  placeholder="John Doe"
                />
                <Field
                  label="Email"
                  value={basics.email}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, email: v }))
                  }
                  placeholder="john@Doe.com"
                />
                <Field
                  label="Phone"
                  value={basics.phone}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, phone: v }))
                  }
                  placeholder="+91 1234567890"
                />
                <Field
                  label="Location"
                  value={basics.location}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, location: v }))
                  }
                  placeholder="ABC, 812345"
                />
                <Field
                  label="Linkedin Url"
                  value={basics.linkedin}
                  onChange={(v: string) =>
                    setBasics((p) => ({ ...p, linkedin: v }))
                  }
                  placeholder="linkedin.com/in/msd"
                />
                <Field
                  label="Professinal Summary (AI will enhance it)"
                  value={summary}
                  onChange={setSummary}
                  placeholder="Brief summary of your experience and goals..."
                  textarea
                />
              </div>
            </Section>

            {/* Work Experience */}
            <Section title="Work Experience">
              {experience.map((exp, ei) => (
                <div
                  key={ei}
                  className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/30 uppercase tracking-widest">
                      Positiion {ei + 1}
                    </span>

                    {experience.length > 1 && (
                      <button
                        onClick={() =>
                          setExperience((p) => p.filter((_, i) => i !== ei))
                        }
                        className="text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Job Title"
                      value={exp.title}
                      onChange={(v: string) => updateExp(ei, "title", v)}
                      placeholder="Software Engineer"
                    />
                    <Field
                      label="Company"
                      value={exp.company}
                      onChange={(v: string) => updateExp(ei, "company", v)}
                      placeholder="Google"
                    />
                    <Field
                      label="Location"
                      value={exp.location}
                      onChange={(v: string) => updateExp(ei, "location", v)}
                      placeholder="ABC, State"
                    />
                    <Field
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(v: string) => updateExp(ei, "startDate", v)}
                      placeholder="April 2026"
                    />
                    <Field
                      label="End Date"
                      value={exp.endDate}
                      onChange={(v: string) => updateExp(ei, "endDate", v)}
                      placeholder="April 2027"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/30 uppercase -tracking-widest">
                      Key Achievements / Responsibilities
                    </label>

                    {exp.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2">
                        <input
                          value={b}
                          onChange={(e) => updateBullet(ei, bi, e.target.value)}
                          placeholder={`Bullet ${bi + 1} - start with an action verb`}
                          className="input-field flex flex-1"
                        />

                        {exp.bullets.length > 1 && (
                          <button
                            onClick={() =>
                              updateExp(
                                ei,
                                "bullets",
                                exp.bullets.filter((_, j) => j !== bi),
                              )
                            }
                            className="text-red-400/50 hover:text-red-400 transition-colors"
                          >
                            <Trash size={13} />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() =>
                        updateExp(ei, "bullets", [...exp.bullets, ""])
                      }
                      className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
                    >
                      <Plus size={10} /> Add Bullet
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setExperience((p) => [...p, blankExp()])}
                className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
              >
                <Plus size={10} /> Add Experience
              </button>
            </Section>

            {/* Education Section */}
            <Section title="Education">
              {education.map((edu, ei) => (
                <div
                  key={ei}
                  className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/30 uppercase tracking-widest">
                      Education {ei + 1}
                    </span>

                    {education.length > 1 && (
                      <button
                        onClick={() =>
                          setEducation((p) => p.filter((_, i) => i !== ei))
                        }
                        className="text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Degree"
                      value={edu.degree}
                      onChange={(v: string) =>
                        setEducation((p) =>
                          p.map((e, i) => (i === ei ? { ...e, degree: v } : e)),
                        )
                      }
                      placeholder="B.Tech CS"
                    />
                    <Field
                      label="College"
                      value={edu.college}
                      onChange={(v: string) =>
                        setEducation((p) =>
                          p.map((e, i) =>
                            i === ei ? { ...e, college: v } : e,
                          ),
                        )
                      }
                      placeholder="ABC College"
                    />
                    <Field
                      label="Location"
                      value={edu.location}
                      onChange={(v: string) =>
                        setEducation((p) =>
                          p.map((e, i) =>
                            i === ei ? { ...e, location: v } : e,
                          ),
                        )
                      }
                      placeholder="Mumbai, India"
                    />
                    <Field
                      label="Year"
                      value={edu.year}
                      onChange={(v: string) =>
                        setEducation((p) =>
                          p.map((e, i) => (i === ei ? { ...e, year: v } : e)),
                        )
                      }
                      placeholder="2026"
                    />
                    <Field
                      label="GPA (optional)"
                      value={edu.gpa}
                      onChange={(v: string) =>
                        setEducation((p) =>
                          p.map((e, i) => (i === ei ? { ...e, gpa: v } : e)),
                        )
                      }
                      placeholder="8.5/10"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setEducation((p) => [...p, blankEdu()])}
                className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
              >
                <Plus size={10} /> Add Education
              </button>
            </Section>

            {/* Skills Section */}
            <Section title="Skills">
              <Field
                label="Technical Skills (comma separated)"
                value={techSkills}
                onChange={setTechSkills}
                placeholder="React, Node.js..."
              />

              <Field
                label="Soft Skills (comma separated)"
                value={softSkills}
                onChange={setSoftSkills}
                placeholder="Leadership, Problem Solving..."
              />
            </Section>

            {/* Project Section */}
            <Section title="Projects (Optional)">
              {projects.map((proj, pi) => (
                <div
                  key={pi}
                  className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/30 uppercase tracking-widest">
                      Project {pi + 1}
                    </span>

                    {projects.length > 1 && (
                      <button
                        onClick={() =>
                          setProjects((p) => p.filter((_, i) => i !== pi))
                        }
                        className="text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Project Name"
                      value={proj.name}
                      onChange={(v: string) =>
                        setProjects((p) =>
                          p.map((e, i) => (i === pi ? { ...e, name: v } : e)),
                        )
                      }
                      placeholder="Ai saas app"
                    />
                    <Field
                      label="Description"
                      value={proj.description}
                      onChange={(v: string) =>
                        setProjects((p) =>
                          p.map((e, i) =>
                            i === pi ? { ...e, description: v } : e,
                          ),
                        )
                      }
                      placeholder="Built with react and node.js..."
                      textarea
                    />
                    <Field
                      label="Link (optional)"
                      value={proj.link}
                      onChange={(v: string) =>
                        setProjects((p) =>
                          p.map((e, i) => (i === pi ? { ...e, link: v } : e)),
                        )
                      }
                      placeholder="github.com/abc/project"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setProjects((p) => [...p, blankProj()])}
                className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
              >
                <Plus size={10} /> Add Project
              </button>
            </Section>

            {/* Certification Section */}
            <Section title="Certifications (Optional)">
              <Field
                label="Certifications (comma separated)"
                value={certificates}
                onChange={setCertificates}
                placeholder="AWS Developer, Google Analytics..."
              />
            </Section>
          </>
        )}

        {mode === "improve" && (
          <>
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
                    <Loader2
                      size={16}
                      className="animate-spin text-indigo-400"
                    />
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
          </>
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
            <FileText size={16} />{" "}
            {mode == "manual" ? "Build my Resume" : "Improve my Resume"}
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">
              Building Your ATS optimized resume...
            </p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="flex flex-col gap-4">
            <div className="glass-card p-8 flex flex-col gap-5 font-mono text-sm">
              <div className="border-b border-white/8 pb-5">
                <h2 className="text-2xl font-bold text-white">{result.name}</h2>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/40 text-xs">
                  {[
                    result.email,
                    result.phone,
                    result.location,
                    result.linkedin,
                  ]
                    .filter(Boolean)
                    .map((v, i) => (
                      <span key={i}>{v}</span>
                    ))}
                </div>
              </div>

              {result.summary && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                    Summary
                  </p>

                  <p className="text-white/60 text-sm leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              )}

              {result.experience?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Experience
                  </p>

                  {result.experience.map((e, i) => (
                    <div key={i} className="mb-4">
                      <div className="flex justify-between flex-wrap gap-1">
                        <span className="font-semibold text-white/80">
                          {e.title} • {e.company}
                        </span>

                        <span className="text-white/35 text-xs">
                          {e.startDate} • {e.endDate}
                        </span>
                      </div>

                      <ul className="mt-1.5 flex flex-col gap-1 pl-3">
                        {e.bullets.filter(Boolean).map((b, j) => (
                          <li
                            key={j}
                            className="text-white/50 text-xs before:content-[-] before:mr-2"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {result.education?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Education
                  </p>
                  {result.education.map((e, i) => (
                    <div
                      key={i}
                      className="flex justify-between flex-wrap gap-1 mb-2"
                    >
                      <span className=" text-white/70 font-medium">
                        {e.degree} • {e.school}
                      </span>

                      <span className="text-white/35 text-xs">
                        {e.year} {e.gpa ? ` • GPA ${e.gpa}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(result.skills?.technical?.length > 0 ||
                result.skills?.soft?.length > 0) && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Skills
                  </p>

                  {result.skills.technical?.length > 0 && (
                    <p className="text-white/55 text-xs mb-1">
                      <span className="text-white/40 font-semibold">
                        Technical:{" "}
                      </span>

                      {result.skills.technical.join(", ")}
                    </p>
                  )}

                  {result.skills.soft?.length > 0 && (
                    <p className="text-white/55 text-xs mb-1">
                      <span className="text-white/40 font-semibold">
                        Soft:{" "}
                      </span>

                      {result.skills.soft.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {result.projects?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Projects
                  </p>

                  {result.projects.map((p, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-white/70 font-semibold">
                        {p.name}{" "}
                        {p.link ? (
                          <span className="text-indigo-400 ml-2 text-xs font-normal">
                            {p.link}
                          </span>
                        ) : (
                          ""
                        )}
                      </p>

                      <p className="text-white/45 text-xs mt-1">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {result.certifications?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Certifications
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {result.certifications.map((c, i) => (
                      <span key={i} className="feature-pill">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => generateResumePDF(result)}
              className="btn-primary py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildResume;

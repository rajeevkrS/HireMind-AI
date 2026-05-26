// This file contains all your TypeScript interfaces/types for the frontend

// Defines logged-in user structure
export interface User {
  _id: string; // MongoDB user ID
  name: string;
  email: string;
  image: string;
  subscription: Date | null; // Stores subscription expiry
  freeRequestsUsed: number; // Tracks free AI usage count
}

// Defines shape of your React Context
export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  LogoutUser: () => void; // Function with no parameters and no return value
}

// Used for AI Job Matcher feature
export interface Job {
  title: string;
  company: string;
  matchScore: number;
  location: string;
  type: string;
  skills: string[];
  whyMatch: string;
  applyTip: string;
}

// Used in AI Interview Generator
export interface Question {
  id: number;
  question: string;
  hint: string;
  category: string;
}

// Groups interview details together
export interface InterviewData {
  role: string;
  round: string;
  questions: Question[];
}

// Used in Resume Builder
export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

// Education section of resume
export interface Education {
  degree: string;
  school: string;
  location: string;
  year: string;
  gpa: string;
}

// Resume project details
export interface Project {
  name: string;
  description: string;
  link: string;
}

// Main resume structure
export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: { technical: string[]; soft: string[] };
  projects: Project[];
  certifications: string[];
}

// Used for ATS scoring sections
export interface ScoreBlock {
  score: number;
  feedback: string;
}

// Used for resume improvement recommendations
export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low"; // Literal Union Type- Only these values allowed
}

// Main ATS analysis result object
export interface Analysis {
  atsScore: number;
  scoreBreakdown: {
    formatting: ScoreBlock;
    keywords: ScoreBlock;
    structure: ScoreBlock;
    readability: ScoreBlock;
  };
  suggestions: Suggestion[];
  strengths: string[];
  summary: string;
}

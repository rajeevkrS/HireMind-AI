import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { TryCatch } from "../middleware/trycatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import User from "../models/User.js";
import { ResumeAnalyserPrompt } from "../config/prompt.js";

dotenv.config();

// Create Gemini Client instance
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI! });

// Retry Helper Function
// the function automatically retries
async function generateContentWithRetry(
  payload: any,
  retries = 2,
): Promise<any> {
  try {
    // Calls Gemini normally
    return await ai.models.generateContent(payload);
  } catch (error: any) {
    console.error("Gemini Error:", error);

    // Check if Error is Temporary
    // If Gemini is overloaded and returns:
    const isTemporaryError =
      error?.status === 503 ||
      error?.message?.includes("high demand") ||
      error?.message?.includes("UNAVAILABLE");

    if (retries > 0 && isTemporaryError) {
      console.log(`Retrying Gemini request... (${retries} left)`);

      // Wait 3 Seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Recursive Call
      return generateContentWithRetry(payload, retries - 1);
    }

    // If all retries fail, pass the error to the controller
    throw error;
  }
}

export const analyseResume = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    // Get PDF Data
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({
        message: "PDF data is required",
      });
    }

    // Find User
    const user = await User.findById(req.user?._id);

    // Check Request Limits
    if (!user || !user.canMakeRequest()) {
      return res.status(403).json({
        message: "Upgrade your plan to continue",
      });
    }

    try {
      // Generate Resume Analysis
      // Calls Gemini
      const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            // Gemini receives: Prompt & PDF together
            parts: [
              {
                // Send Prompt
                text: ResumeAnalyserPrompt,
              },
              {
                // Send PDF
                inlineData: {
                  mimeType: "application/pdf",
                  // Remove Base64 Prefix
                  // Frontend sends: data:application/pdf;base64,ABCDEF...
                  // Gemini wants only: Gemini wants only:
                  data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
                },
              },
            ],
          },
        ],
      });

      // Extract Gemini Response
      // Gemini may return:
      // ```json
      // { "score": 85 }
      // ```;

      // Remove markdown:
      // { "score": 85 }
      const rawText = response.text?.replace(/```json|```/g, "").trim();

      // Empty Response Check
      if (!rawText) {
        return res.status(500).json({
          message: "AI returned an empty response. Please try again.",
        });
      }

      let jsonResponse;

      try {
        // Parse JSON
        // Convert: "{\"score\":85}" -> { "score": 85 }
        jsonResponse = JSON.parse(rawText);
      } catch (error) {
        console.error("JSON Parse Error:", error);

        return res.status(500).json({
          message:
            "AI returned an unexpected response format. Please try again.",
        });
      }

      // Increase Usage Count
      // Only free users consume credits
      if (!user.hasProAccess()) {
        user.freeRequestsUsed += 1;
        await user.save(); // Save User
      }

      // Send Result
      return res.status(200).json(jsonResponse);
    } catch (error: any) {
      console.error("Analyse Resume Error:", error);

      const isHighDemandError =
        error?.status === 503 ||
        error?.message?.includes("high demand") ||
        error?.message?.includes("UNAVAILABLE");

      if (isHighDemandError) {
        return res.status(503).json({
          message:
            "Our AI analysis service is currently experiencing high traffic. Please try again in a few minutes.",
        });
      }

      return res.status(500).json({
        message:
          "Unable to analyse your resume at the moment. Please try again later.",
      });
    }
  },
);

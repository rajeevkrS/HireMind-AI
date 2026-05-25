// This code sets up Google OAuth authentication using the Google APIs. It creates an OAuth client that helps users login with Google.

import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Creates Google OAuth client
// auth()- Contains authentication-related features
// OAuth2()- Handle Google login authentication
export const oauth2client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "postmessage",
);

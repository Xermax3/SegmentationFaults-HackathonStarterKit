import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
export default async function getAccessToken() {
  try {
    const cookies = cookieParser.JSONCookies(
      process.env["GITHUB_ACCESS_TOKEN"]
    );
    return cookies.accessToken;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response?.data || error.message
    );
    throw new Error("Error getting access token");
  }
}

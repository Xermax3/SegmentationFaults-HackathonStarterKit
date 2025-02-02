import cookieParser from "cookie-parser";
export default async function getAccessToken(req) {
  try {
    const cookies = cookieParser.JSONCookies(req.headers.cookie);
    return cookies.access_token;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response?.data || error.message
    );
    throw new Error("Error getting access token");
  }
}

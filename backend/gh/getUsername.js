import { Octokit } from "@octokit/core";
import getAccessToken from "./getAccessToken.js";

export default async function getUsername() {
  try {
    const accessToken = await getAccessToken();
    console.log("Access Token:", accessToken);
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.request("GET /user");
    console.log("GitHub Username:", data.login);
    return data.login;
  } catch (error) {
    console.error(
      "Error getting GitHub username:",
      error.response?.data || error.message
    );
    throw new Error("Error getting GitHub username");
  }
}

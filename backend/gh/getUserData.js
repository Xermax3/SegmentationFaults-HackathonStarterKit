import { Octokit } from "@octokit/core";
import getAccessToken from "./getAccessToken.js";

export default async function getUserData(accessToken) {
  try {
    console.log("Access Token:", accessToken);
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.request("GET /user");
    console.log("GitHub Username:", data.login);
    console.log(
      "GitHub Email:",
      data.email === null ? "push@github.com" : data.email
    );
    return data;
  } catch (error) {
    console.error(
      "Error getting GitHub userdata:",
      error.response?.data || error.message
    );
    throw new Error("Error getting GitHub username");
  }
}

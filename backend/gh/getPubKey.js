import { Octokit } from "octokit";
import getUserData from "./getUserData.js";

export default async function getPubKey(accessToken, repoName) {
  try {
    const octokit = new Octokit({ auth: accessToken });
    const userdata = await getUserData(accessToken);
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/actions/secrets/public-key",
      {
        owner: userdata.login,
        repo: repoName,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log("Public key:", data);
    return data;
  } catch (error) {
    console.error("Error getting public key:", error);
  }
}

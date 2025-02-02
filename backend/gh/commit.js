import { Octokit } from "octokit";
import getUserData from "./getUserData.js";

export default async function commit(
  accessToken,
  repoName,
  filePath,
  content,
  message
) {
  try {
    const octokit = new Octokit({ auth: accessToken });
    const userdata = await getUserData(accessToken);
    const { data } = await octokit.request(
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        owner: userdata.login,
        repo: repoName,
        path: filePath,
        message: message,
        committer: {
          name: userdata.login,
          email: userdata.email === null ? "push@github.com" : userdata.email,
        },
        content: content,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log("File committed:", data.content.html_url);
  } catch (error) {
    console.error("Error committing file:", error);
  }
}

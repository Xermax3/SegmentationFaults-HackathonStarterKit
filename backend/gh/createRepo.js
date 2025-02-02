import { Octokit } from "octokit";
import getUsername from "./getUsername.js";

export default async function createRepo(
  accessToken,
  repoName,
  isPrivate = false
) {
  try {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.request("POST /user/repos", {
      name: repoName,
      description: `Created ${repoName} using the GitHub API`,
      homepage: "https://github.com",
      private: isPrivate,
      is_template: false,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
      has_issues: true,
      has_projects: true,
      allow_squash_merge: true,
      allow_merge_commit: true,
    });
    console.log("Repo created:", data.html_url);

    // TODO: LISTREPO CHECK SHOULD BE DELETED BEFORE PRODUCTION
    const { data: repos } = await octokit.request(
      "GET /user/{username}/repos",
      {
        username: getUsername(),
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log("User's repos:", repos);
    // TODO: LISTREPO CHECK SHOULD BE DELETED BEFORE PRODUCTION

    return data.html_url;
  } catch (error) {
    console.error(
      "Error creating GitHub repository:",
      error.response?.data || error.message
    );
    throw new Error("Error creating GitHub repository");
  }
}

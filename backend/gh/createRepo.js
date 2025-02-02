import { Octokit } from "octokit";

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
    return data.html_url;
  } catch (error) {
    console.error(
      "Error creating GitHub repository:",
      error.response?.data || error.message
    );
    throw new Error("Error creating GitHub repository");
  }
}

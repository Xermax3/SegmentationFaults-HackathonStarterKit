import { Octokit } from "octokit";
import getUserData from "./getUserData.js";

export default async function setSecret(
  accessToken,
  repoName,
  secretName,
  secretValue,
  key_id
) {
  try {
    const octokit = new Octokit({ auth: accessToken });
    const userdata = await getUserData(accessToken);
    const { data } = await octokit.request(
      "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
      {
        owner: userdata.login,
        repo: repoName,
        secret_name: secretName,
        encrypted_value: secretValue,
        key_id: key_id,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log("Secret set:", data);
  } catch (error) {
    console.error("Error setting secret:", error);
  }
}

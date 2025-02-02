import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import createRepo from "./createRepo.js";

const accessToken = process.env.GITHUB_ACCESS_TOKEN; // From .env file
console.log("Access Token:", accessToken);
const repoName = "my-new-repo";

(async () => {
  try {
    const repoUrl = await createRepo(accessToken, repoName);
    console.log("GitHub Repo URL:", repoUrl);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();

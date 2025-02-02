import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
// import createRepo from "./createRepo.js";
import cookieParser from "cookie-parser";
import fs from "fs";
import commit from "./commit.js";

// Load accessToken from cookie
const accessToken = cookieParser.JSONCookies(
  process.env["GITHUB_ACCESS_TOKEN"]
);

// console.log("Access Token:", accessToken);
const repoName = "my-new-repo";
const filePath = ".github/workflows/deploy-react-node.yaml";
const commitMessage = "Add deployment workflow";
const localFilePath =
  "/home/iyers16/Documents/conuhacks/SegmentationFaults-HackathonStarterKit/backend/deployment-configs/deploy-react-node.yaml";

(async () => {
  try {
    // const repoUrl = await createRepo(accessToken, repoName);
    // console.log("GitHub Repo URL:", repoUrl);

    // Read the content of the local file
    const content = fs.readFileSync(localFilePath, { encoding: "base64" });
    console.log("File content:", content);

    // Commit and push the file to the repository
    await commit(accessToken, repoName, filePath, content, commitMessage);
    // console.log("File committed to the repository");
  } catch (error) {
    console.error("Error:", error.message);
  }
})();

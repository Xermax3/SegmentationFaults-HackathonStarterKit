import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
// import createRepo from "./createRepo.js";
import cookieParser from "cookie-parser";
import fs from "fs";
import commit from "./commit.js";
import getPubKey from "./getPubKey.js";
import setSecret from "./setSecret.js";
import sodium from "sodium-native";

// Load accessToken from cookie
const accessToken = cookieParser.JSONCookies(
  process.env["GITHUB_ACCESS_TOKEN"]
);
const vercelToken = process.env["VERCEL_TOKEN"];
console.log("Vercel Token:", vercelToken);

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
    // const content = fs.readFileSync(localFilePath, { encoding: "base64" });
    // console.log("File content:", content);
    // Commit and push the file to the repository
    // await commit(accessToken, repoName, filePath, content, commitMessage);
    // console.log("File committed to the repository");
    // set the secret with libsodium and retrieve public key for encryption
    // Step 1: Retrieve the repo's public key
    const pubKey = await getPubKey(accessToken, repoName);
    console.log("Public key:", pubKey);

    // Step 2: Prepare encryption buffers
    const messageBuffer = Buffer.from(vercelToken); // Convert secret to Buffer
    const encryptedToken = Buffer.alloc(
      sodium.crypto_box_SEALBYTES + messageBuffer.length
    );

    // Step 3: Encrypt the secret using the repo's public key
    const pubKeyBuffer = Buffer.from(pubKey.key, "base64"); // Decode base64 public key
    sodium.crypto_box_seal(encryptedToken, messageBuffer, pubKeyBuffer);

    console.log("Encrypted token (Base64):", encryptedToken.toString("base64"));

    // Step 4: Set the secret in the GitHub repository
    await setSecret(
      accessToken,
      repoName,
      "VERCEL_TOKEN",
      encryptedToken.toString("base64"), // Send encrypted secret
      pubKey.key_id
    );

    console.log("✅ Vercel token securely set in GitHub Secrets.");
  } catch (error) {
    console.error("Error:", error.message);
  }
})();

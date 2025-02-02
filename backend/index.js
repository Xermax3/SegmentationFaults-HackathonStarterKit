import dotenv from "dotenv";
dotenv.config({path: "./.env"})

import express from "express";
import path from "path";
import axios from "axios";
import passport from "passport";
import cookies from "cookie-parser";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import createRepo from "./gh/createRepo.js";
import commit from "./gh/commit.js";
import getPubKey from "./gh/getPubKey.js";
import setSecret from "./gh/setSecret.js";
import sodium from "sodium-native";
import {fileURLToPath} from "url";
import fs from "fs";
// import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
// app.use(cors());
app.use(
  session({
    secret: process.env["SESSION_SECRET"] || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // change when using HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookies());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Passport config
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env["GITHUB_APP_CLIENT_ID"],
      clientSecret: process.env["GITHUB_APP_CLIENT_SECRET"],
      callbackURL:
        process.env["GITHUB_APP_CALLBACK_URL"] + "/oauth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Auth Routes
app.get(
  "/oauth/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    failureRedirect: "/",
  })
);

app.get("/oauth/github/callback", async (req, res) => {
  const code = req.query.code;
  console.log("Auth code: " + code);

  if (!code) {
    return res.status(400).send("Code not found");
  }

  try {
    const result = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env["GITHUB_APP_CLIENT_ID"],
        client_secret: process.env["GITHUB_APP_CLIENT_SECRET"],
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    console.log(
      "[oauth/callback - Pre cookie update] Access Token:",
      result.data.access_token
    );
    console.log(
      "[oauth/callback - Pre cookie update] Refresh Token:",
      result.data.refresh_token
    );

    // Store the tokens in the session or database
    res.cookie("accessToken", result.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", result.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // log the access token to the console from cookie
    // limitation: this will log to console after the user has auth'ed at least once, but does not break functionality
    console.log(
      "[oauth/callback - Post cookie update] Access Token:",
      req.cookies.accessToken
    );
    console.log(
      "[oauth/callback - Post cookie update] Refresh Token:",
      req.cookies.refreshToken
    );

    const repoName = `my-${req.session.projectDetails[0].toLowerCase()}-${req.session.projectDetails[1].toLowerCase()}-app`

    const yamlType = getYamlType(req.session.projectDetails[0].toLowerCase(), req.session.projectDetails[1].toLowerCase())

    await createRepo(req.cookies.accessToken, repoName, false);

    const pubKey = await getPubKey(req.cookies.accessToken, repoName);
    console.log("Public key:", pubKey);

    // Step 2: Prepare encryption buffers
    const messageBuffer = Buffer.from(req.session.vercelApiKey); // Convert secret to Buffer
    const encryptedToken = Buffer.alloc(
        sodium.crypto_box_SEALBYTES + messageBuffer.length
    );

    // Step 3: Encrypt the secret using the repo's public key
    const pubKeyBuffer = Buffer.from(pubKey.key, "base64"); // Decode base64 public key
    sodium.crypto_box_seal(encryptedToken, messageBuffer, pubKeyBuffer);

    console.log("Encrypted token (Base64):", encryptedToken.toString("base64"));

    // Step 4: Set the secret in the GitHub repository
    await setSecret(
        req.cookies.accessToken,
        repoName,
        "VERCEL_TOKEN",
        encryptedToken.toString("base64"), // Send encrypted secret
        pubKey.key_id
    );

    console.log("✅ Vercel token securely set in GitHub Secrets.");

    console.log('Current directory: ' + process.cwd());

    let filePath = `./deployment-configs/${yamlType}`;
    if(process.env.NODE_ENV === "production") {
        filePath = `../deployment-configs/${yamlType}`;
    }

    await commit(req.cookies.accessToken, repoName, `.github/workflows/${yamlType}`, fs.readFileSync(filePath, { encoding: "base64" }), "Add deployment workflow");

    res.redirect("/");
  } catch (error) {
    console.error("Error exchanging code for access token:", error);
    res.status(500).send("Error exchanging code for access token");
  }
});

function getYamlType(frontend, backend) {
    if (frontend === "react" && backend === "node.js") {
        return "deploy-react-node.yaml";
    } else if (frontend === "react" && backend === "flask") {
        return "deploy-react-flask.yaml";
    } else if (frontend === "angular" && backend === "node.js") {
        return "deploy-angular-node.yaml";
    } else {
        return "deploy-angular-flask.yaml";
    }
}

// Middleware to check and refresh access token if expired
/**
 * Middleware to check and refresh the access token if it is expired.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function checkAndRefreshToken(req, res, next) {
  const accessToken = cookies("accessToken");
  const refreshToken = cookies("refreshToken");

  console.log("[checkAndRefreshToken] Access Token:", accessToken);
  console.log("[checkAndRefreshToken] Refresh Token:", refreshToken);

  if (accessToken && refreshToken) {
    if (await isTokenExpired(accessToken)) {
      try {
        const result = await axios.post(
          "https://github.com/login/oauth/access_token",
          {
            client_id: process.env["GITHUB_APP_CLIENT_ID"],
            client_secret: process.env["GITHUB_APP_CLIENT_SECRET"],
            refresh_token: refreshToken,
            grant_type: "refresh_token",
          },
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        const { access_token } = result.data.access_token;
        const { refresh_token } = result.data.refresh_token;

        res.cookie("accessToken", access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
        res.cookie("refreshToken", refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      } catch (error) {
        console.error("Error refreshing access token:", error.response?.data);
        return res.status(500).send("Error refreshing access token");
      }
    }
  }
  next();
}

// Helper function to check if token is expired (simplified)
async function isTokenExpired(token) {
  // Check if token is expired by querying https://api.github.com/orgs/google/repos
  // If the response is 401, then the token is expired
  console.log("[isTokenExpired] Checking if token is expired");
  const result = await axios.get("https://api.github.com/orgs/google/repos", {
    headers: {
      Accept: "application/json",
      // 'Authorization': `Bearer ${token}`
      Authorization: "Bearer asjdkhaskjdahksdjahksjdh",
    },
  });
  return result.status === 401;
}

// Main route
app.get("/", (req, res) => {
  checkAndRefreshToken(req, res);
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

app.post("/send-project-details", (req, res) => {
  const { frontend, backend, vercelApiKey } = req.body;

  req.session.projectDetails = [frontend, backend];
  req.session.vercelApiKey = vercelApiKey;

  res.send("Project details received");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

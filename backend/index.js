require('dotenv').config();

const express = require("express");
const path = require("path");
const axios = require("axios");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const session = require('express-session');
// const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
// app.use(cors());
app.use(session({
  secret: process.env['SESSION_SECRET'] || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Passport config
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env['GITHUB_APP_CLIENT_ID'],
    clientSecret: process.env['GITHUB_APP_CLIENT_SECRET'],
    callbackURL: process.env['GITHUB_APP_CALLBACK_URL'] + '/oauth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Auth Routes
app.get("/oauth/github", passport.authenticate("github", { scope: ["user:email"], failureRedirect: "/" }));

app.get("/oauth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    const code = req.query.code;
    console.log('code: ' + code);

    if (!code) {
      return res.status(400).send('Code not found');
    }

    try {
      const result = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env['GITHUB_APP_CLIENT_ID'],
        client_secret: process.env['GITHUB_APP_CLIENT_SECRET'],
        code: code
      }, {
        headers: {
          'Accept': 'application/json'
        }
      });

      const { access_token, refresh_token } = result.data;
      console.log('Access Token:', access_token);
      console.log('Refresh Token:', refresh_token);

      // Store the tokens in the session or database
      req.session.accessToken = access_token;
      req.session.refreshToken = refresh_token;

      res.redirect("/");
    } catch (error) {
      console.error('Error exchanging code for access token:', error.response.data);
      res.status(500).send('Error exchanging code for access token');
    }
  });

// Middleware to check and refresh access token if expired
async function checkAndRefreshToken(req, res, next) {
  const accessToken = req.session.accessToken;
  const refreshToken = req.session.refreshToken;

  // Check if access token is expired (this is a simplified check, you may need a more robust method)
  if (!accessToken || isTokenExpired(accessToken)) {
    try {
      const result = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env['GITHUB_APP_CLIENT_ID'],
        client_secret: process.env['GITHUB_APP_CLIENT_SECRET'],
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Accept': 'application/json'
        }
      });

      const { access_token } = result.data;
      req.session.accessToken = access_token;
      console.log('New Access Token:', access_token);
    } catch (error) {
      console.error('Error refreshing access token:', error.response.data);
      return res.status(500).send('Error refreshing access token');
    }
  }

  next();
}

// Helper function to check if token is expired (simplified)
function isTokenExpired(token) {
  // Implement your logic to check if the token is expired
  return false;
}

// Use the middleware for routes that require authentication
app.use('/protected-route', checkAndRefreshToken, (req, res) => {
  res.send('This is a protected route');
});

// Main route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// // Main route
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

// temp test endpoint
// app.get('/test-endpoint', (req, res) => {
//     res.send('Hello from the API');
// });

app.post("/send-project-details", (req, res) => {
    const { frontend, backend, deployment } = req.body;
    console.log("Frontend:", frontend, typeof frontend);
    console.log("Backend:", backend, typeof backend);
    console.log("Deployment:", deployment, typeof deployment);
    res.send("Project details received");
    });

// API endpoint
app.get("/api/products", async (req, res) => {
  try {
    const response = await axios.get("https://fakestoreapi.com/products");
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
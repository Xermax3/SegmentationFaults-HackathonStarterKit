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
  saveUninitialized: false,
  cookie: { secure: false } // change when using HTTPS
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
  async (req, res) => {
    const code = req.query.code;
    console.log('Auth code: ' + code);

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

      // console.log(result.data);

      // Store the tokens in the session or database
      res.cookie('accessToken', result.data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', result.data.refresh_token, { httpOnly: true, secure: true });

      // log the access token to the console from cookie
      console.log('Access Token:', req.cookies.accessToken);
      console.log('Refresh Token:', req.cookies.refreshToken);

      res.redirect("/");
    } catch (error) {
      console.error('Error exchanging code for access token:', error.response?.data);
      res.status(500).send('Error exchanging code for access token');
    }
  });

// Middleware to check and refresh access token if expired
async function checkAndRefreshToken(req, res, next) {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);

  if (accessToken && refreshToken) {
  const refreshToken = req.cookies.refreshToken;
    if (await isTokenExpired(accessToken)) {
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
        console.error('Error refreshing access token:', error.response?.data);
        return res.status(500).send('Error refreshing access token');
      }
    }
  }

  next();
}

// Helper function to check if token is expired (simplified)
async function isTokenExpired(token) {
  // Check if token is expired by querying https://api.github.com/orgs/google/repos
  // If the response is 401, then the token is expired
  console.log("Checking if token is expired");
  const result = await axios.get('https://api.github.com/orgs/google/repos', {
    headers: {
      'Accept': 'application/json',
      // 'Authorization': `Bearer ${token}`
      'Authorization': 'Bearer asjdkhaskjdahksdjahksjdh'
    }
  });
  return result.status === 401;
  
}

// Use the middleware for routes that require authentication
// app.use('/', checkAndRefreshToken, (req, res) => {
//   res.send('This is a protected route');
// });

// Main route
app.get("/", (req, res) => {
  checkAndRefreshToken(req, res);
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
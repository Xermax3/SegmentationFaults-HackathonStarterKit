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
app.get("/oauth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get("/oauth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => res.redirect("/")
);

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
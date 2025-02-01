require('dotenv').config();

const express = require("express");
const path = require("path");
const axios = require("axios");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const session = require('express-session');

const app = express();

var passport = require("passport");

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// GitHub vars
var GitHubStrategy = require("passport-github");

// Passport init
passport.use(new GitHubStrategy({
    clientID: process.env['GITHUB_APP_CLIENT_ID'],
    clientSecret: process.env['GITHUB_APP_CLIENT_SECRET'],
    callbackURL: "http://localhost:4000/oauth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// GitHub Auth Routes
app.get("/auth/github", passport.authenticate("github", { failureRedirect: "/" }),
  function(req, res) {
    // If successful auth
    res.redirect("/");
  });

// Handle requests by serving index.html for all routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// API endpoint
app.use("/api/products", async (req, res) => {
  const response = await axios.get("https://fakestoreapi.com/products");
  res.send(response.data);
});

// Start the server
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

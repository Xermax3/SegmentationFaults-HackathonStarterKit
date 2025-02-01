const express = require("express");
const path = require("path");
const axios = require("axios");
var cors = require('cors')
const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Temporary for testing, remove in production
app.use(cors())

// GitHub vars
// var gitHubStrategy = require("passport-github").Strategy;

// Passport init
// passport.use(new gitHubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: "http://localhost:4000/auth/github/callback"
// },
// function(accessToken, refreshToken, profile, cb) {
//   return cb(null, profile);
// }
// ));

// GitHub Auth Routes
// app.get("/auth/github", passport.authenticate("github", { failureRedirect: "/" }),
//   function(req, res) {
//     // If successful auth
//     res.redirect("/");
//   });

// Add json middleware
app.use(express.json());

// Handle requests by serving index.html for all routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// temp test endpoint
app.get('/test-endpoint', (req, res) => {
    res.send('Hello from the API');
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

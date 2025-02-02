const { Octokit } = require("@octokit/core");

module.exports = async function getGithubUsername(accessToken) {
  try {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.request("GET /user");
    return data.login;
  } catch (error) {}
};

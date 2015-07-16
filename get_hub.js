var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var rp = require('request-promise');
var path = require('path');
var R = require('ramda');

var args = process.argv.slice(2);


if (!args[0]) {
  throw new Error('Access token not passed.');
}

var accessToken = args[0];

var githubUsername;
var githubAccessToken;
var homeDir = process.env['HOME'];

/**
 * Get User data.
 *
 * @param userId
 *   The user ID.
 *
 * @returns {*}
 */
var getUser = function() {
  var backendUrl = process.env.BACKEND_URL;
  var options = {
    url: backendUrl + '/api/me/',
    qs: {
      access_token: accessToken,
      fields: 'id,label,github_access_token',
      github_access_token: true
    }
  };

  return rp.get(options);
};

getUser()
  .then(function(response) {
    // Get the ssh key from the repository.
    var data = JSON.parse(response).data[0];
    githubUsername = data.label;
    githubAccessToken = data.github_access_token;

    return fs.readFileAsync(homeDir + '/.config/hub', 'utf8');
  })
  .then(function(data) {
    data = data
      .replace(/<username>/g, githubUsername)
      .replace(/<access_token>/g, githubAccessToken);

    return fs.writeFileAsync(homeDir + '/.config/hub', data);
  })
  .then(function() {
    // Prepare ~/.netrc with the user's access token and password, so we won't
    // get a prompt.
    return fs.readFileAsync(homeDir + '/.netrc', 'utf8');
  })
  .then(function(data) {
    data = data
      .replace(/<access_token>/g, githubAccessToken);

    return fs.writeFileAsync(homeDir + '/.netrc', data);
  })
  .catch(function(err) {
    console.log(err);
  });

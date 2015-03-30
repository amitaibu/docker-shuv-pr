var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"))
var rp = require('request-promise');
var path = require('path');
var R = require('ramda');

var arguments = process.argv.slice(2);


if (!arguments[0]) {
  throw new Error('Build ID not passed.');
}
else if (!arguments[1]) {
  throw new Error('Access token not passed.');
}

var accessToken = arguments[1];

/**
 * Get User data.
 *
 * @param userId
 *   The user ID.
 *
 * @returns {*}
 */
var getUser = function(userId) {
  var backendUrl = 'http://localhost/shoov/www';
  var options = {
    url: backendUrl + '/api/me/',
    qs: {
      access_token: accessToken,
      fields: 'id,label, github_access_token',
      github_access_token: true
    }
  };

  return rp.get(options);
};

var githubUsername;
var githubAccessToken
var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];


getUser(arguments[0])
  .then(function(response) {
    // Get the ssh key from the repository.
    var data = JSON.parse(response).data[0];
    githubUsername = data.label;
    githubAccessToken = data.github_access_token;

    return fs.readFileAsync(homeDir + '/.config/hub');
  })
  .then(function(data) {
    data
      .replace('<username>', githubUsername)
      .replace('<access_token>', githubAccessToken);

    return fs.writeFileAsync(homeDir + '/.config.hub', data);
  })
  .catch(function(err) {
    console.log(err);
  });

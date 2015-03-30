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
      fields: 'id,label, github_access_token'
    }
  };

  return rp.get(options);
};

getUser(arguments[0])
  .then(function(response) {
    // Get the ssh key from the repository.
    var data = JSON.parse(response);
    var repoId = data.data[0].repository;
  })
  .then(function(response) {
    var data = JSON.parse(response);

    var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    // return fs.writeFileAsync(homeDir + '/.config.hub', R.prop('ssh_private_key', data.data[0]));
  })
  .catch(function(err) {
    console.log(err);
  });

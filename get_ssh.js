var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var rp = require('request-promise');
var mkdirp = Promise.promisifyAll(require('mkdirp'));
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
 * Get Build data.
 *
 * @param buildId
 *   The build ID.
 *
 * @returns {*}
 */
var getBuild = function(buildId) {
  var backendUrl = process.env.BACKEND_URL;
  var options = {
    url: backendUrl + '/api/builds/' + buildId,
    qs: {
      access_token: accessToken,
      fields: 'id,repository'
    }
  };

  return rp.get(options);
};

/**
 * Get Repository data.
 *
 * @param repoId
 *   The repository ID.
 *
 * @returns {*}
 */
var getRepository = function(repoId) {
  var backendUrl = process.env.BACKEND_URL;
  var options = {
    url: backendUrl + '/api/repositories/' + repoId,
    qs: {
      access_token: accessToken,
      fields: 'id,ssh_private_key',
      ssh_key: true
    }
  };

  return rp.get(options);
};

getBuild(arguments[0])
  .then(function(response) {
    // Get the ssh key from the repository.
    var data = JSON.parse(response);
    var repoId = data.data[0].repository;
    return getRepository(repoId);
  })
  .then(function(response) {
    var data = JSON.parse(response).data[0];
    process.stdout.write(R.prop('ssh_private_key', data));
  })
  .catch(function(err) {
    console.log(err);
  });

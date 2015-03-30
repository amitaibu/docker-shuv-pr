var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"))
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



/**
 * Get SSH key.
 *
 * @param buildId
 * @param accessToken
 * @returns {*}
 */
var getSshKey = function(buildId, accessToken) {

  var backendUrl = 'http://localhost/shoov/www';
  var options = {
    url: backendUrl + '/api/builds/' + buildId,
    qs: {
      access_token: accessToken,
      fields: 'id,baseline_name,regression,directory_prefix'
    }
  };

  var req = rp.get(options);
  req
    .on('error', function (err) {
      throw new Error(err);
    })
    .on('response', function(response) {
      if (response.statusCode !== 200) {
        throw new Error('Access token is incorrect');
      }
    });

  return req;
};

var pickSshKey = function(obj) {
  return R.prop('git_commit', obj);
};

getSshKey(arguments[0], arguments[1])
  .then(function(response) {
    var data = JSON.parse(response);
    return fs.writeFileAsync('foo.txt', pickSshKey(data.data[0]));
  });

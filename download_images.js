var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"))
var rp = require('request-promise');
var mkdirp = Promise.promisifyAll(require('mkdirp'));
var path = require('path');
var R = require('ramda');

var arguments = process.argv.slice(2);


if (!arguments[0]) {
  throw new Error('Screenshots IDs not passed.');
}
else if (!arguments[1]) {
  throw new Error('Access token not passed.');
}

var screenshotIds = arguments[0];
var accessToken = arguments[1];


var getFilesInfo = function(ids) {
  var backendUrl = process.env.BACKEND_URL;

  var options = {
    url: backendUrl + '/api/screenshots/' + ids,
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
}


var downloadFile = function(obj) {

  var options = {
    url: obj.regression.self,
    qs: {
      access_token: accessToken
    }
  };

  obj.directory_prefix = obj.directory_prefix || '';
  var fileName = obj.directory_prefix + obj.baseline_name;

  mkdirp.mkdirpAsync(path.dirname(fileName))
    .then(function () {
      var req = rp.get(options);
      req
        .on('error', function (err) {
          throw new Error(err);
        })
        .on('response', function(response) {
          if (response.statusCode !== 200) {
            throw new Error('Access token is incorrect');
          }
        })
        // Write the file.
        .pipe(fs.createWriteStream(fileName));

      return req;

    });
};

getFilesInfo(screenshotIds)
  .then(function(response) {
    var data = JSON.parse(response);
    var downloaded = R.forEach(downloadFile, data.data);
    return Promise.all(downloaded);
  })
  .then(function() {
    console.log('Downloaded all files');
  });

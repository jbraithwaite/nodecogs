var http = require('http');

module.exports = function(config, callback){

  var options = {
    host: config.host,
    path: config.path,
    headers: {
      'user-agent': config.userAgent
    },
    json: true
  };

  // If you are looking to debug, this would be a great place to put:
  // console.log(config.host + options.path);

  // Make the request
  http.get(options, function(res) {

    // Server did not like our request because ...

    // Unauthorized
    if (res.statusCode == 401) return callback({error: 'You’re attempting to access a resource that first requires authentication', statusCode:res.statusCode});

    // Forbidden
    else if (res.statusCode == 403) return callback({error: 'You’re not allowed to access this resource. Even if you authenticated, or already have, you simply don’t have permission.', statusCode:res.statusCode});

    // Not Found
    else if (res.statusCode == 404) return callback({error: 'The resource you requested doesn’t exist', statusCode:res.statusCode});

    // Method Not Allowed
    else if (res.statusCode == 405) return callback({error: 'You’re trying to use an HTTP verb that isn’t supported by the resource.', statusCode:res.statusCode});

    // Unprocessable Entity
    else if (res.statusCode == 422) return callback({error: 'Your request was well-formed, but there’s something semantically wrong with the body of the request.', statusCode:res.statusCode});

    // A generic server error
    else if (res.statusCode == 500) return callback({error: 'Server side issue', statusCode:res.statusCode});

    // Some other reason
    else if (res.statusCode != 200 && res.statusCode != 201) return callback({error: 'Well that didn\'t work...', statusCode:res.statusCode});

    // Output data
    var data = '';

    // Gather up all the data chunks
    res.on('data', function (chunk) {
      console.log(chunk);
      data += chunk;
    });

    // ... When they are all gathered
    res.on('end', function () {
      console.log(data);
      // ... try to
      try {

        // ... parse the data as JSON
        data = JSON.parse(data);

        // ... catching any errors
      } catch (e) {
        return callback({error:'Could not parse response as JSON'});
      }

      // 400 errors contain useful information
      if (res.statusCode == 400) {
        data.statusCode = res.statusCode;
        return callback(data);
      }

      // Should be good, call the callback
      callback(null, data);
    });

  // Error on request
  }).on('error', function(e) {
    callback(e);
  });
};

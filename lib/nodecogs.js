var querystring = require('querystring');
var request = require('./request');

var VERSION = '0.0.1';
var _host = 'api.discogs.com';
var _path = '/';
var _per_page = 50;
var _userAgent = 'nodecogs/' + VERSION + ' +https://github.com/jbraithwaite/nodecogs';

/**
 * Initialize Nodecogs
 *
 * The configuration:
 * - host: custom host for querying data
 * - basePath: custom path to the data
 * - defaultPerPage: default per_page on request that require it. (Defaults to 50. Max is 100)
 * - userAgent: User agent sent in the request
 * - accessKey: Personal access key created at https://www.discogs.com/settings/developers
 * - accessSecret: Personal access secret created at https://www.discogs.com/settings/developers
 *
 * @param {Object} options The application configuration
 */
function BaseNodecogs(options) {

  options = options || {};

  this.host = _host;
  this.basePath = _path;
  this.per_page = options.defaultPerPage || _per_page;
  this.userAgent = options.userAgent || _userAgent;
  this.accessKey = options.accessKey;
  this.accessSecret = options.accessSecret;
}

function DiscogsEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A").replace(/%20/g, "+");
}

BaseNodecogs.prototype.request = request;


/**
 * [PRIVATE] Database Resource
 *
 * Make a reqest to the database resource
 *
 * "I'm sorry but this is a private function, I'm going to have to ask that you leave."
 *
 * @param  {Array} type Array of the resources to access e.g. ['artists','releases']
 * @param  {Integer} id The Discogs ID for the main resource
 * @param  {Object} pagination e.g. {page: X, per_page: Y}
 * @param  {Function} callback function(err, response)
 *
 * @return {[type]} [description]
 */
BaseNodecogs.prototype._database = function(type, id, pagination, callback) {

  var paginationString = '';

  if (typeof pagination === 'function') {
    callback = pagination;
  } else if (typeof pagination === 'object') {

    var page = pagination.hasOwnProperty('page') ? pagination.page : 1;
    var per_page = pagination.hasOwnProperty('per_page') ? pagination.per_page : this.per_page;

    // Constuct the pagination string
    paginationString = '?page=' + page + '&per_page=' + per_page;
  }

  var mainResource = type[0];
  var secondaryResource = type[1] ? '/' + type[1] : '';

  var path = this.basePath + mainResource + '/' + id + secondaryResource + paginationString;

  // Auth
  var authString = 'key=' + this.accessKey + '&secret=' + this.accessSecret;
  if (paginationString != '') {
    authString = '&' + authString
  } else {
    authString = '?' + authString;
  }
  path += authString;

  this.request({
    host: this.host,
    path: path,
    userAgent: this.userAgent,
  }, callback);
};

/**
 * [PRIVATE] Search
 *
 * @param  {Object} parameters
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype._search = function(parameters, callback) {

  var querystring = '';
  var page = parameters.hasOwnProperty('page') ? parameters.page : 1;
  var per_page = parameters.hasOwnProperty('per_page') ? parameters.per_page : this.per_page;

  if (parameters.hasOwnProperty('page')) {
    page = parameters.page;
    delete parameters.page;
  }

  if (parameters.hasOwnProperty('per_page')) {
    per_page = parameters.per_page;
    delete parameters.per_page;
  }

  var joiner = '';

  for (var param in parameters) {

    if (param == 'q') {
      // Discogs API doesn't like most characters encoded in the URL (especially `:`, `?`)
      querystring += joiner + param + '=' + parameters[param].replace(/\s/g, '%20');
    } else {
      querystring += joiner + param + '=' + DiscogsEncodeURIComponent(parameters[param]);
    }

    joiner = '&';
  }

  if (querystring !== '') {
    querystring += '&';
  }

  var path = this.basePath + 'database/search?' + querystring + 'page=' + page + '&per_page=' + per_page;

  // Auth
  path += "&key=" + this.accessKey + "&secret=" + this.accessSecret


  this.request({
    host: this.host,
    path: path,
    userAgent: this.userAgent,
  }, callback);
};


/**
 * Artist Resource
 *
 * The Artist resource represents a person in the Discogs database
 * who contributed to a Release in some capacity.
 *
 * @param  {Integer} id Discogs Artist ID, (aXXXXXX)
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.artist = function(id, callback) {
  this._database(['artists'], id, callback);
};

/**
 * Artist Releases
 *
 * Returns a list of Releases and Masters associated with the artist.
 * Accepts Pagination parameters.
 *
 * @param  {Integer} id Discogs Artist ID, (aXXXXXX)
 * @param  {Object} pagination {page: X, per_page: Y}
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.artistReleases = function(id, pagination, callback) {
  this._database(['artists', 'releases'], id, pagination, callback);
};

/**
 * Release Resource
 *
 * The Release resource represents a particular physical or digital
 * object released by one or more Artists.
 *
 * @param  {Integer} id Discogs Release ID, (rXXXXXX)
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.release = function(id, callback) {
  this._database(['releases'], id, callback);
};

/**
 * Master Resource
 *
 * The Master resource represents a set of similar Releases. Masters
 * (also known as “master releases”) have a “main release” which is
 * often the chronologically earliest.
 *
 * @param  {Integer} id Discogs Master ID, (mXXXXXX)
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.master = function(id, callback) {
  this._database(['masters'], id, callback);
};

/**
 * Master Versions
 *
 * Retrieves a list of all Releases that are versions of this master.
 * Accepts Pagination parameters.
 *
 * @param  {Integer} id Discogs Master ID, (mXXXXXX)
 * @param  {Object} pagination {page: X, per_page: Y}
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.masterVersions = function(id, pagination, callback) {
  this._database(['masters', 'versions'], id, pagination, callback);
};

/**
 * Label
 *
 * The Label resource represents a label, company, recording studio,
 * location, or other entity involved with Artists and Releases.
 * Labels were recently expanded in scope to include things that
 * aren’t labels – the name is an artifact of this history.
 *
 * @param  {Integer} id Discogs Label ID, (lXXXXXX)
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.label = function(id, callback) {
  this._database(['labels'], id, callback);
};

/**
 * Label Releases
 *
 * Returns a list of Releases associated with the label.
 * Accepts Pagination parameters.
 *
 * @param  {Integer} id Discogs Label ID, (lXXXXXX)
 * @param  {Object} pagination {page: X, per_page: Y}
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.labelReleases = function(id, pagination, callback) {
  this._database(['labels', 'releases'], id, pagination, callback);
};

/**
 * Image
 *
 * The Image resource represents a user-contributed image of a
 * database object, such as Artists or Releases.
 *
 * Image requests are subject to rate limiting; see
 * [Rate Limiting](http://www.discogs.com/developers/accessing.html#rate-limiting)
 * for details.
 *
 * Note: The response is binary image data.
 *
 * @param  {string} filename
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.image = function(filename, callback) {
  this._fetchImage(filename, callback);
};

/**
 * Search
 *
 * The Search resource lists objects in the database that meet the criteria you specify.
 *
 * - http://www.discogs.com/developers/resources/database/search-endpoint.html
 * - http://www.discogs.com/help/account/browsing-and-searching
 *
 * @param  {Object} parameters
 * @param  {Function} callback function(err, response)
 */
BaseNodecogs.prototype.search = function(parameters, callback) {
  this._search(parameters, callback);
};


module.exports = BaseNodecogs;
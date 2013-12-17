# Discogs API v2.0 Client

[![Build Status](https://secure.travis-ci.org/jbraithwaite/nodecogs.png?branch=master)](http://travis-ci.org/jbraithwaite/nodecogs) [![Total views](https://sourcegraph.com/api/repos/github.com/jbraithwaite/nodecogs/counters/views.png)](https://sourcegraph.com/github.com/jbraithwaite/nodecogs)

Nodecogs is a thin wrapper that gives you access to the [Discogs](http://www.discogs.com/) API ([Version 2.0](http://www.discogs.com/developers/)).

### Example Usage

Nodecogs asks that you [identifying your application](http://www.discogs.com/developers/accessing.html#required-headers) so be sure to set the `userAgent`. You are strongly encouraged to follow the conventions of [RFC 1945](http://tools.ietf.org/html/rfc1945#section-3.7)

```javascript
var NC = require('nodecogs');

// Initialize Nodecogs
var nc = new NC({userAgent:'my-awesome-app/0.0.1 ( http://my-awesome-app.com )'});
```

Setting a custom `host`, `basePath` and `defaultPerPage` (if not set, the `defaultPerPage` is 50);

```javascript
var nc = new NC({host:'localhost', basePath:'/path/to/data/', defaultPerPage: 50});
```

## Resources

There are three main resources: `Database`, `Marketplace` and `User`. The current version of `Nodecogs` only supports the `Database` resource.

### Database Resource

The Database resouce contains six resources:

1. [Artist][1]
2. [Release][2]
3. [Master][3]
4. [Label][4]
5. [Image][5]
6. [Search][6]

### Artists

The `artist` resource represents a person in the Discogs database who contributed to a [Release][2] in some capacity.

```javascript
nc.artist(1602787, function(err, response){
    console.log(response);
});
```

Returns a list of [Releases][2] and [Masters][3] associated with the `artist`. Accepts Pagination parameters.

```javascript
nc.artistReleases(1602787, {page: 2, per_page: 10}, function(err, response){
    console.log(response);
});
```

If you do not include the pagination perameters, the `page` is 1 and the `per_page` is 50.

```javascript
nc.artistReleases(1602787, function(err, response){
    console.log(response);
});
```

### Release

The `release` resource represents a particular physical or digital object released by one or more [Artists][1].

Look up a release:

```javascript
nc.release(2113771, function(err, response){
    console.log(response);
});
```

### Master

The `master` resource represents a set of similar [Releases][2]. Masters (also known as “master releases”) have a “main release” which is often the chronologically earliest.

```javascript
nc.master(220990, function(err, response){
    console.log(response);
});
```

Retrieves a list of all [Releases][2] that are versions of this `master`. Accepts Pagination parameters.

```javascript
nc.masterVersions(220990, function(err, response){
    console.log(response);
});
```

### Label

The `label` resource represents a label, company, recording studio, location, or other entity involved with [Artists][1] and [Releases][2]. Labels were recently expanded in scope to include things that aren’t labels – the name is an artifact of this history.

```javascript
nc.label(22532, function(err, response){
    console.log(response);
});
```

Returns a list of [Releases][2] associated with the `label`. Accepts Pagination parameters.

```javascript
nc.labelReleases(22532, function(err, response){
    console.log(response);
});
```

### Image

The Image resource represents a user-contributed image of a database object, such as [Artists][1] or [Releases][2].

```javascript
nc.image('A-1602787-1368176977-5588.jpeg', function(err, response){

    // Binary image data
    console.log(response);
});
```

### Search

The [Search][6] resource lists objects in the database that meet the criteria you specify.

```javascript
nc.search({type:'release', country:'UK', page: 2, per_page: 3}, function(err, response){
    console.log(response);
});
```

Take into the power of [Lucene search][8] by using the `q` parameter.

```javascript
nc.search({type:'release', q:'artist:t??l OR artist:afx AND -year:1997'}, function(err, response){
    console.log(response);
});
```

#### todo

- Rate limits

[1]: http://www.discogs.com/developers/resources/database/artist.html
[2]: http://www.discogs.com/developers/resources/database/release.html
[3]: http://www.discogs.com/developers/resources/database/master.html
[4]: http://www.discogs.com/developers/resources/database/label.html
[5]: http://www.discogs.com/developers/resources/database/image.html
[6]: http://www.discogs.com/developers/resources/database/search.html
[7]: http://www.discogs.com/developers/accessing.html#rate-limiting
[8]: http://www.discogs.com/help/account/browsing-and-searching

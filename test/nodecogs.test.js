var NC = require('../lib/nodecogs');

// Replace the NC.request with our own function
// Consider adding two additional test suites
// 1) Make a few actual network requests
// 2) Uses Simon (or something similar) to fake requests
NC.prototype.request = function(config, callback){
  // It returns no errors and calls back with the path
  callback(null, config.path);
};


var assert = require("assert");

describe('Nodecogs', function(){

  // Describe the constructor
  describe('Constructor', function(){

    describe('Defaults', function(){
      it('host (api.discogs.com)', function(){
        var nc = new NC();
        assert.equal(nc.host, 'api.discogs.com');
      });

      it('basePath (/)', function(){
        var nc = new NC();
        assert.equal(nc.basePath, '/');
      });

      it('per_page (50)', function(){
        var nc = new NC();
        assert.equal(nc.per_page, 50);
      });

    });

    it('Can set User Agent', function(){
      var nc = new NC({userAgent:'my-app/0.0.1 ( http://myapp.com )'});
      assert.equal(nc.userAgent, 'my-app/0.0.1 ( http://myapp.com )');
    });

    it('Can set Default Per Page', function(){
      var nc = new NC({defaultPerPage: 100});
      assert.equal(nc.per_page, 100);
    });

    it('Can set all at the same time', function(){
      var nc = new NC({defaultPerPage:100 ,userAgent:'my-app/0.0.1 ( http://myapp.com )'});
      assert.equal(nc.userAgent, 'my-app/0.0.1 ( http://myapp.com )');
      assert.equal(nc.per_page, 100);
    });

  });

  // Describe database lookups for...
  describe('Database', function(){

    // Artists
    describe('Artists', function(){
      it('Look up an artist', function(){
        var nc = new NC();

        nc.artist('87016', function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/artists/87016');
        });
      });

      it('Look up an artist\'s releases', function(){
        var nc = new NC();

        nc.artistReleases('87016', function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/artists/87016/releases');
        });
      });

      it('Paginate releases (just setting page) ', function(){
        var nc = new NC();

        nc.artistReleases('87016', {page: 3}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/artists/87016/releases?page=3&per_page=50');
        });
      });

      it('Paginate releases (just setting per_page) ', function(){
        var nc = new NC();

        nc.artistReleases('87016', {per_page: 25}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/artists/87016/releases?page=1&per_page=25');
        });
      });

      it('Paginate releases (setting page and per_page)', function(){
        var nc = new NC();

        nc.artistReleases('87016', {page: 2, per_page: 30}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/artists/87016/releases?page=2&per_page=30');
        });
      });
    });

    // Releases
    describe('Releases', function(){
      it('Look up a release', function(){
        var nc = new NC();

        nc.release('1659014', function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/releases/1659014');
        });
      });
    });

    // Masters
    describe('Masters', function(){
      it('Look up a master', function(){
        var nc = new NC();

        nc.master('8471', function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/masters/8471');
        });
      });

      it('Look up a master\'s versions', function(){
        var nc = new NC();

        nc.masterVersions('8471', function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/masters/8471/versions');
        });
      });
    });

    // Labels
    describe('Labels', function(){
      it('Look up a label', function(){
        var nc = new NC();

        nc.label('1', function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/labels/1');
        });
      });

      it('Look up a label\'s releases', function(){
        var nc = new NC();

        nc.labelReleases('1', function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/labels/1/releases');
        });
      });
    });

    // Images
    describe('Images', function(){
      it('Look up a label', function(){
        var nc = new NC();

        nc.image('R-1684003-1236712979.jpeg', function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/image/R-1684003-1236712979.jpeg');
        });
      });
    });

    // Search
    describe('Search', function(){
      it('Empty search', function(){
        var nc = new NC();

        nc.search({}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?page=1&per_page=50');
        });
      });

      it('Search by type', function(){
        var nc = new NC();

        nc.search({type:'artist'}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?type=artist&page=1&per_page=50');
        });
      });

      it('Search by country', function(){
        var nc = new NC();

        nc.search({country:'UK'}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?country=UK&page=1&per_page=50');
        });
      });

      it('Search by type and country', function(){
        var nc = new NC();

        nc.search({type:'release', country:'UK'}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?type=release&country=UK&page=1&per_page=50');
        });
      });

      it('Search by type and country with pagination', function(){
        var nc = new NC();

        nc.search({type:'release', country:'UK', page: 2, per_page: 3}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?type=release&country=UK&page=2&per_page=3');
        });
      });

      it('Search with a simple query', function(){
        var nc = new NC();

        nc.search({type:'release', q:'artist:afx'}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?type=release&q=artist:afx&page=1&per_page=50');
        });
      });

      it('Search with a query (contains OR)', function(){
        var nc = new NC();

        nc.search({type:'release', q:'artist:afx OR artist:tool'}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?type=release&q=artist:afx%20OR%20artist:tool&page=1&per_page=50');
        });
      });

      it('Search with a query (contains Wildcard)', function(){
        var nc = new NC();

        nc.search({type:'release', q:'artist:t??l'}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?type=release&q=artist:t??l&page=1&per_page=50');
        });
      });

      it('Search with an advanced query', function(){
        var nc = new NC();

        nc.search({type:'release', q:'artist:t??l OR artist:afx AND -year:1997'}, function(err, path){
          assert.equal(err, null);
          assert.equal(path, '/database/search?type=release&q=artist:t??l%20OR%20artist:afx%20AND%20-year:1997&page=1&per_page=50');
        });
      });

    });

    // http://api.discogs.com/database/search?per_page=3&page=2

  // End of describe database
  });

});

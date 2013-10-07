LibreMap.bbox2couch = function (bbox) {
  return [bbox[0][1],bbox[0][0],bbox[1][1],bbox[1][0]];
}

LibreMap.isInBbox = function(lat, lon, bbox) {
  return bbox[0][0]<=lat && lat<=bbox[1][0] && bbox[0][1]<=lon && lon<=bbox[1][1];
}

LibreMap.BboxCollection = Backbone.Collection.extend({
  // stores options.bbox for later use and hands over to backbone's
  // initialize().
  // bbox = [[sw_lat, sw_lon], [ne_lat,ne_lon]]
  initialize: function (models, options) {
    this.bbox = options.bbox || [[0,0],[0,0]];
    Backbone.Collection.prototype.initialize.call(this, arguments);
    this.on('sync', function() {
      this.watch_abort();
      this.watch();
    });
  },
  // fetches all models in the bounding box from couchdb
  // (uses the spatial view)
  fetch: function (options) {
    options = _.extend(options ? options : {}, {
      data: {
        bbox: LibreMap.bbox2couch(this.bbox).toString()
      }
    });
    Backbone.Collection.prototype.fetch.call(this, options);
  },
  // parse output of couchdb's spatial view
  parse: function (response, options) {
    this.update_seq = response.update_seq;
    return _.map(response.rows, function(row) {
      return row.value;
    });
  },
  // sets up live changes from couchdb's _changes feed.
  // sends a bounding box and a list of ids whose nodes are outside the
  // bounding box to the filter function
  watch: function () {
    (function poll() {
      // gather all ids of routers that are inside the collection but outside
      // the current bounding box
      var ids_outside = _.map(
        this.filter(function(model) {
          var loc = model.get('location');
          return !LibreMap.isInBbox(loc.lat, loc.lon, this.bbox);
        }.bind(this)),
        function(model) {
          return model.id;
        });
      // create a new request to the changes feed
      this.changes_request = $.ajax({
        url: this.changesUrl + '?' + $.param({
          filter: this.changesFilter,
          feed: 'longpoll',
          include_docs: 'true',
          since: this.update_seq || 0
        }),
        // use POST because GET potentially has a low maximal length of the
        // query string
        type: "post",
        data: JSON.stringify({
          "ids": ids_outside,
          "bbox": LibreMap.bbox2couch(this.bbox)
        }),
        dataType: "json",
        contentType: "application/json",
        timeout: 65000,
        success: function(data) {
          // update update_seq, merge the changes and set up a new changes
          // request
          this.update_seq = data.last_seq;
          var docs = _.map(data.results, function(row) {
            return row.doc;
          });
          this.set(docs, {remove: false});
          poll.bind(this)();
        }.bind(this),
        error: function(jqxhr, msg_status, msg_err) {
          // if not aborted via watch_abort: retry after 10s
          // otherwise: do nothing :)
          if (this.changes_request) {
            this.changes_request = null;
            console.log('changes feed: failed ('+msg_status+'): '+msg_err);
            console.log('changes feed: retrying in 10s...');
            setTimeout(poll.bind(this), 10000);
          }
        }.bind(this)
      });
    }).bind(this)();
  },
  // abort watch
  watch_abort: function() {
    if (this.changes_request) {
      var request = this.changes_request;
      this.changes_request = null;
      request.abort();
    }
  },
  // change the bounding box and fetch
  set_bbox: function(bbox, options) {
    this.bbox = bbox;
    this.fetch( _.extend(options||{}, {remove: false}));
  },
  fetch_links: function() {
    var models_inbbox = this.filter(function(model) {
      var loc = model.get('location');
      return LibreMap.isInBbox(loc.lat, loc.lon, this.bbox);
    }.bind(this));
    var links = _.without(
      _.map(models_inbbox, function(model){
        return model.get('links');
      }), undefined);
    var aliases = _.map(_.flatten(links), function(link) {
      return _.pick(link, 'alias', 'type');
    });

    var known_aliases_strings = _.map(_.flatten(
        _.without(this.pluck('aliases'), undefined)
      ), JSON.stringify).sort();

    var unknown_aliases = _.reject(aliases, function (alias) {
      return _.indexOf(known_aliases_strings, JSON.stringify(alias))>=0;
    });

    console.log('debug: fetch missing links: '+JSON.stringify(unknown_aliases));

    return $.ajax({
      url: this.byAliasUrl,
      // use POST because GET potentially has a low maximal length of the
      // query string
      type: "post",
      data: JSON.stringify({"keys": unknown_aliases}),
      dataType: "json",
      contentType: "application/json",
      success: function(data) {
        var docs = _.pluck(data.rows, 'value');
        this.set(docs, {remove: false});
        this.watch_abort();
        this.watch();
      }.bind(this),
      error: function(jqxhr, msg_status, msg_err) {
        console.log('fetch_links: failed ('+msg_status+'): '+msg_err);
      }
    });
  }
});

var api_base_url = 'http://libremap.net/api';
LibreMap.RouterBboxCollection =  LibreMap.BboxCollection.extend({
  url: api_base_url + '/routers_by_location_stripped',
  byAliasUrl: api_base_url + '/routers_by_alias_stripped',
  changesUrl: api_base_url + '/changes',
  changesFilter: 'libremap-api/by_id_or_bbox',
  model: LibreMap.RouterStripped
});

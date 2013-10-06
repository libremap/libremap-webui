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
      this.changes_request = $.ajax({
        url: this.changesUrl + '?' + $.param({
          filter: this.changesFilter,
          feed: 'longpoll',
          include_docs: 'true',
          since: this.update_seq || 0
        }),
        type: "post",
        data: JSON.stringify({
          "ids": [],
          "bbox": LibreMap.bbox2couch(this.bbox)
        }),
        dataType: "json",
        contentType: "application/json",
        timeout: 65000,
        success: function(data) {
          this.update_seq = data.last_seq;
          var docs = _.map(data.results, function(row) {
            return row.doc;
          });
          this.set(docs, {remove: false});
          poll.bind(this)();
        }.bind(this),
        error: function(jqxhr, msg_status, msg_err) {
          // if not aborted via watch_abort: retry after 10s
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
    this.fetch(options);
  }
});

LibreMap.RouterBboxCollection =  LibreMap.BboxCollection.extend({
  url: 'http://libremap.net/api/routers_by_location',
  changesUrl: 'http://libremap.net/api/changes',
  changesFilter: 'libremap-api/by_id_or_bbox',
  model: LibreMap.Router
});

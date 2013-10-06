LibreMap.BboxCollection = Backbone.Collection.extend({
  initialize: function (models, options) {
    this.bbox = options.bbox;
    Backbone.Collection.prototype.initialize.call(this, arguments);
  },
  fetch: function (options) {
    options = _.extend(options ? options : {}, {
      data: { 
        bbox: this.bbox.toString()
      }
    });
    Backbone.Collection.prototype.fetch.call(this, options);
  },
  parse: function (response, options) {
    return _.map(response.rows, function(row) { 
      return row.value;
    });
  },
  set_bbox: function(latlng_sw, latlng_ne, options) {
    this.latlng_sw = latlng_sw;
    this.latlng_ne = latlng_ne;
    this.fetch(options);
  }
});

LibreMap.RouterBboxCollection =  LibreMap.BboxCollection.extend({
  url: 'http://libremap.net/api/routers_by_location',
  model: LibreMap.Router
});

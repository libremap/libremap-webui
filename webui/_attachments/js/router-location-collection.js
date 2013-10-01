LibreMap.SpatialCollection = Backbone.Collection.extend({
  initialize: function (latlng_sw, latlng_ne) {
    this.latlng_sw = latlng_sw;
    this.latlng_ne = latlng_ne;
    Backbone.Collection.prototype.initialize.call(this, arguments);
  },
  fetch: function (options) {
    var bbox = [
        this.latlng_sw[1], this.latlng_sw[0],
        this.latlng_ne[1], this.latlng_ne[0] 
      ];
    options = _.extend(options ? options : {}, {
      data: { 
        bbox: bbox.toString()
      }
    });
    Backbone.Collection.prototype.fetch.call(this, options);
  },
  set_bbox: function(latlng_sw, latlng_ne, options) {
    this.latlng_sw = latlng_sw;
    this.latlng_ne = latlng_ne;
    this.fetch(options);
  }
});

LibreMap.RouterLocationCollection =  LibreMap.SpatialCollection.extend({
  url: '/api/routers_by_location',
  model: LibreMap.Router
});

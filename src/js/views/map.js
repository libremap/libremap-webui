var Backbone = require('backbone');
var _ = require('underscore');
var L = require('leaflet');
var common = require('libremap-common');
var couchmap_common = require('couchmap-common');
var config = require('../../../config.json');
var MapView = require('couchmap-leaflet/views/map');

// pass el, router and configModel to constructor (gets stored automatically)
module.exports = MapView.extend({
  initialize: function (options) {
    this.router = options.router;

    MapView.prototype.initialize.call(this, _.extend({
      addDefaultLayer: false,
      zoomTo: false
    }, options || {}));

    var world_bounds = [[-60,-180],[75,180]];
    // init map bounds (will be reset via router if bbox was provided)
    this.map.fitBounds(world_bounds);

    // bind to router bbox event
    this.router.on('route:bbox', function(bbox) {
      bbox = couchmap_common.bbox(bbox);
      if (bbox) {
        // valid bbox
        bbox = couchmap_common.toLeaflet();
        var lat = bbox[1][0] - bbox[0][0];
        var lon = bbox[1][1] - bbox[0][1];
        var ratio = 0.01;
        bbox[0][0] += ratio*lat;
        bbox[1][0] -= ratio*lat;
        bbox[0][1] += ratio*lon;
        bbox[1][1] -= ratio*lon;
        this.map.fitBounds(bbox);
      } else {
        this.map.fitBounds(world_bounds);
      }
    }, this);
    this.map.on('moveend', function(e) {
      var bbox = couchmap_common.bbox(this.map.getBounds());
      this.trigger('bbox', bbox);
      this.router.navigate('bbox/'+bbox.toString());
    }, this);

  }
});

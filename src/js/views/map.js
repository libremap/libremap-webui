var Backbone = require('backbone');
var _ = require('underscore');
var L = require('leaflet');
var common = require('libremap-common');
var couchmap_common = require('couchmap-common');
var MapView = require('couchmap-leaflet/views/map');

// pass el, router and configModel to constructor (gets stored automatically)
module.exports = MapView.extend({
  initialize: function (options) {
    this.router = options.router;
    this.configModel = options.configModel;

    MapView.prototype.initialize.call(this, _.extend({
      addDefaultLayer: false,
      zoomTo: false,
      mapOptions: {
        worldCopyJump: true
      }
    }, options || {}));

    // init map bounds (will be reset via router if bbox was provided)
    var bounds = this.configModel.get('init_bbox') || [[-60,-180],[75,180]];
    this.map.fitBounds(bounds);

    // add scale
    L.control.scale({
      position: 'bottomright',
      imperial: false
    }).addTo(this.map);

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
        this.map.fitBounds(bounds);
      }
    }, this);
    this.map.on('moveend', function(e) {
      var bbox = couchmap_common.bbox(this.map.getBounds());
      this.trigger('bbox', bbox);
      this.router.navigate('bbox/'+bbox.toString());
    }, this);

  }
});

var Backbone = require('backbone');
var _ = require('underscore');
var L = require('leaflet');
var common = require('libremap-common');
var config = require('../../../config.json');

// pass 'collection' and 'el' to constructor (gets stored automatically)
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.router = options.router;

    var layers = {};
    _.each(config.layers, function(layer, name) {
      if (layer.type=="tileLayer") {
        layers[name] = L.tileLayer(layer.url, layer.options || {});
      }
    });
    // use default cloudmade layer if no layer was given in config.json
    if (!_.size(layers)) {
      layers['Cloudmade OSM'] = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        "key": 'e4e152a60cc5414eb81532de3d676261',
        "styleId": 997,
        "attribution": "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery &copy; <a href=\"http://cloudmade.com\">CloudMade</a>"
        });
    }
    this.layers = layers

    // init map
    this.map = L.map(this.el, {layers: _.values(layers)});
    this.map.fitWorld();

    // bind to router bbox event
    this.router.on('route:bbox', function(bbox) {
      bbox = common.bbox(bbox);
      if (bbox) {
        // valid bbox
        var bbox = common.toLeaflet();
        var lat = bbox[1][0] - bbox[0][0];
        var lon = bbox[1][1] - bbox[0][1];
        var ratio = 0.01;
        bbox[0][0] += ratio*lat;
        bbox[1][0] -= ratio*lat;
        bbox[0][1] += ratio*lon;
        bbox[1][1] -= ratio*lon;
        this.map.fitBounds(common.bbox(bbox).toLeaflet());
      } else {
        this.map.fitWorld();
      }
    }.bind(this));
    this.map.on('moveend', function(e) {
      function bounds2bbox(bounds) {
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        return [[sw.lat,sw.lng],[ne.lat,ne.lng]];
      }
      var bbox = common.bbox(bounds2bbox(this.map.getBounds()));
      this.router.navigate('bbox/'+bbox.toString());
    }.bind(this));
  },
});

var Backbone = require('backbone');
var _ = require('underscore');
var L = require('leaflet');
var config = require('../../../config.json');

// pass 'collection' and 'el' to constructor (gets stored automatically)
module.exports = Backbone.View.extend({
  initialize: function () {
    var layers = {};
    _.each(config.layers, function(layer, name) {
      console.log(layer);
      if (layer.type=="tileLayer") {
        layers[name] = L.tileLayer(layer.url, layer.options || {});
      }
    });
    if (!_.size(layers)) {
      layers['Cloudmade OSM'] = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        "key": 'e4e152a60cc5414eb81532de3d676261',
        "styleId": 997,
        "attribution": "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery &copy; <a href=\"http://cloudmade.com\">CloudMade</a>"
        });
    }
    this.map = L.map(this.el, {layers: _.values(layers)});
    this.map.fitWorld();
  },
});

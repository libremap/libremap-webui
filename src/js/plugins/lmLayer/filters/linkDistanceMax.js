var Backbone = require('backbone');
var NumberView = require('./numberView');
var L = require('leaflet');

module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      var router1 = model.get('routerModel1');
      var router2 = model.get('routerModel2');
      var latlng1 = L.latLng([router1.get('lat'), router1.get('lon')]);
      var latlng2 = L.latLng([router2.get('lat'), router2.get('lon')]);
      var distance = latlng1.distanceTo(latlng2);
      return distance <= this.get('val');
    }
  }),
  controlView: NumberView.extend({
    placeholder: 'Maximum distance (m)'
  })
};

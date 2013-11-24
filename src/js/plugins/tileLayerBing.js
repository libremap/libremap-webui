var TileLayer = require('./tileLayer');
var Lbing = require('leaflet-bing');
var _ = require('underscore');

module.exports = _.extend(_.clone(TileLayer), {
  view: TileLayer.view.extend({
    render: function() {
      this.remove();
      this.layer = L.bingLayer(
        this.model.get('key'),
        this.model.get('options').toJSON()
      ).addTo(this.mapView.map);
    }
  })
});

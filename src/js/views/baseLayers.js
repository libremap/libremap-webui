var Backbone = require('backbone');
var L = require('leaflet');

/* BaseLayersView
 *
 * requires a BaseLayersModel as this.model and a mapView in options.
 */
module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.mapView = options.mapView;
    this.listenTo(this.model, 'change', this.render, this);
    this.render();
  },
  render: function() {
    this.remove();
    var layerModel = this.model.coll.get(this.model.get('active_id'));
    this.layer = L.tileLayer(layerModel.get('url'), layerModel.get('options').toJSON()).addTo(this.mapView.map);
  },
  remove: function() {
    if (this.layer) {
      this.mapView.map.removeLayer(this.layer);
    }
  }
});

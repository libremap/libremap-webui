var FineView = require('couchmap-leaflet/views/fine');

module.exports = FineView.extend({
  initialize: function(options) {
    this.configModel = options.configModel;
    this.listenTo(this.configModel, 'change:cluster', this.render);
    FineView.prototype.initialize.apply(this, arguments);
  },
  render: function() {
    this.removeSubviews();
    var layer = this.configModel.get('cluster') ? 
        L.markerClusterGroup : L.layerGroup;
    this.layer = layer().addTo(this.proxyView.mapView.map);
    this.collection.each(this.addModel, this);
  }
});

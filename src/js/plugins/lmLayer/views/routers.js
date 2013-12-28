var FineView = require('couchmap-leaflet/views/fine');
var FineMarkerView = require('couchmap-leaflet/views/fineMarker');
var appconfig = require('../../../../../config.json');

var RouterMarkerView = FineMarkerView.extend({
  template: require('templates').lmRouterPopup,
  render: function() {
    this.removeMarker();
    this.marker = L.marker([this.model.get('lat'), this.model.get('lon')],{
      title: this.model.get('hostname')
    })
      .addTo(this.layer)
      .bindPopup(
        L.popup().setContent(
          this.template(_.extend({
            api_url: appconfig.api_url
          }, this.model.toJSON()))
        )
      );
  }
});

module.exports = FineView.extend({
  FineMarkerView: RouterMarkerView,
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

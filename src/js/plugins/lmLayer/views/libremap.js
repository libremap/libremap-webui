var Backbone = require('backbone');
var LibreMapProxyModel = require('../models/proxy');
var LibreMapProxyView = require('./proxy');
var LibreMapFineView = require('./fine');

module.exports = Backbone.View.extend({
  attribution: 'Routers+Links &copy; <a href="http://libremap.net">LibreMap</a> contributors under <a href="http://opendatacommons.org/licenses/odbl/summary/">ODbL</a>',
  initialize: function(options) {
    this.mapView = options.mapView;
    this.mapView.map.attributionControl.addAttribution(this.attribution);
    this.listenTo(this.model, 'change:api_url change:fine_max', this.render, this);
    this.render();
  },
  render: function() {
    this.removeSubview();
    this.libreMapProxyModel = new LibreMapProxyModel(null, {
      libreMapModel: this.model
    });
    this.subview = new LibreMapProxyView({
      mapView: this.mapView,
      model: this.libreMapProxyModel,
      FineView: LibreMapFineView,
      fine_options: {
        LibreMapModel: this.model
      }
    });
    return this;
  },
  removeSubview: function() {
    if (this.subview) {
      this.subview.remove();
      this.subview = undefined;
    }
    if (this.libreMapProxyModel) {
      this.libreMapProxyModel.abort();
    }
  },
  remove: function() {
    this.removeSubview();
    this.mapView.map.attributionControl.removeAttribution(this.attribution);
    Backbone.View.prototype.remove.call(this);
  }
});

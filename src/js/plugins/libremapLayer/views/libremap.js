var Backbone = require('backbone');
var LibreMapProxyModel = require('../models/proxy');
var LibreMapProxyView = require('./proxy');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.mapView = options.mapView;
    this.listenTo(this.model, 'change', this.render, this);
    this.render();
  },
  render: function() {
    this.remove();
    this.libreMapProxyModel = new LibreMapProxyModel(null, {
      api_url: this.model.get('api_url'),
      fine_max: this.model.get('fine_max')
    });
    this.subview = new LibreMapProxyView({
      mapView: this.mapView,
      model: this.libreMapProxyModel
    });
    return this;
  },
  remove: function() {
    if (this.subview) {
      this.subview.remove();
      this.subview = undefined;
    }
    if (this.libreMapProxyModel) {
      this.libreMapProxyModel.abort();
    }
  }
});

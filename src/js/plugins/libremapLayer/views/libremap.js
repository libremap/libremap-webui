var Backbone = require('backbone');
var ProxyView = require('couchmap-leaflet/views/proxy');
var LibreMapModel = require('../models/libremap');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.mapView = options.mapView;
    this.listenTo(this.model, 'change', this.render, this);
    this.render();
  },
  render: function() {
    this.remove();
    var libreMapModel = new LibreMapModel(null, {
      api_url: this.model.get('api_url')
    });
    this.subview = new ProxyView({
      mapView: this.mapView,
      model: libreMapModel
    });
    return this;
  },
  remove: function() {
    if (this.subview) {
      this.subview.remove();
      this.subview = undefined;
    }
  }
});

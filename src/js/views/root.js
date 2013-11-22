var Backbone = require('backbone');
var appconfig = require('../../../config.json');
var ControlsView = require('./controls');
var MapView = require('./map');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.router = options.router;
    this.configModel = options.configModel;

    var template = require('templates').rootView;
    this.$el.html(template({title: appconfig.title}));
    this.$('a.about').on('click', function() {
      this.$('div.about').modal();
      return false;
    }.bind(this) );

    // add MapView
    this.mapView = new MapView({
      el: this.$('.lm-map'),
      router: this.router,
      libreMap: this.libreMap,
      layer_plugins: this.layer_plugins
    });

    var ProxyModel = require('couchmap-backbone/models/proxy');
    this.proxyModel = new ProxyModel();

    var ProxyView = require('couchmap-leaflet/views/proxy');
    this.proxyView = new ProxyView({
      model: this.proxyModel,
      mapView: this.mapView
    });

    this.controlsView = new ControlsView({el: this.$('.lm-sidebar'), mapView: this.mapView});
  },
  remove: function() {
    this.controlsView.remove();
    this.mapView.remove();
  }
});

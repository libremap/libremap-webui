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
      configModel: this.configModel
    });

    this.baseLayersView = new (require('./baseLayers'))({
      model: this.configModel.baseLayersModel,
      mapView: this.mapView
    });

    var ProxyModel = require('../models/proxy');
    this.proxyModel = new ProxyModel(null, {
      configModel: this.configModel
    });

    var ProxyView = require('./proxy');
    this.proxyView = new ProxyView({
      mapView: this.mapView,
      model: this.proxyModel,
      configModel: this.configModel
    });

    this.controlsView = new ControlsView({
      el: this.$('.lm-sidebar'), 
      mapView: this.mapView,
      configModel: this.configModel
    });
  },
  remove: function() {
    this.controlsView.remove();
    this.mapView.remove();
  }
});

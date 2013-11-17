var Backbone = require('backbone');
var appconfig = require('../../../config.json');
var LibreMapModel = require('../models/libreMapModel');
var ControlView = require('./controlView');
var MapView = require('./mapView');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    /*
    // TODO: move out of view
    this.layer_plugins = {
      tile: {
        model: Backbone.Model.extend({
          initialize: function(options) {
            this.on('bbox', function(bbox){console.log(bbox);});
          }
        }), //require('../models/layerTileModel.js'),
        view: Backbone.View.extend({
          initialize: function(options) {
            this.mapView = options.mapView;
            this.mapView.on('bbox', function(bbox) {
              this.model.trigger('bbox', bbox);
            }, this);
            this.layer = L.tileLayer(this.model.get('url'), this.model.get('options'));
            this.mapView.map.addLayer(this.layer);
          }
        }),
        configView: null
      }
    };

    this.libreMap = new LibreMapModel({layer_plugins: this.layer_plugins});
    */
    this.router = options.router;

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

    this.controlView = new ControlView({el: this.$('.lm-sidebar'), mapView: this.mapView});
  },
  remove: function() {
    this.controlView.remove();
    this.mapView.remove();
  }
});

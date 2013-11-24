var Backbone = require('backbone');
var _ = require('underscore');
var L = require('leaflet');
var appconfig = require('../../../config.json');
var package = require('../../../package.json');

// pass 'collection' and 'el' to constructor (gets stored automatically)
module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.configModel = options.configModel;
    this.mapView = options.mapView;
    this.render();
  },
  render: function () {
    var template = require('templates').controlView;
    this.$el.html(template({
      config: appconfig,
      package: package
    }));
    this.baseLayersControls = new (require('./baseLayersControls'))({
      el: this.$('.baseLayers'),
      model: this.configModel.baseLayersModel
    });
    return this;
  },
  remove: function() {
    if (this.baseLayersControls) {
      this.baseLayersControls.remove();
    }
  }
});

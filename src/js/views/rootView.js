var Backbone = require('backbone');
var appconfig = require('../../../config.json');
var ConfigModel = require('../models/configModel');
var ControlView = require('./controlView');
var MapView = require('./mapView');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.router = options.router;
    this.config = new ConfigModel(null, {appconfig: appconfig});
    this.render();
  },
  render: function () {
    var template = require('templates').rootView;
    this.$el.html(template({title: appconfig.title}));
    this.$('a.about').on('click', function() {
      this.$('div.about').modal();
      return false;
    }.bind(this) );
    this.mapView = new MapView({el: this.$('.lm-map'), router: this.router});
    this.controlView = new ControlView({el: this.$('.lm-sidebar'), config: this.config, mapView: this.mapView});
    return this;
  }
});

var Backbone = require('backbone');
var _ = require('underscore');
var appconfig = require('../../../config.json');


module.exports = Backbone.Model.extend({
  initialize: function(options) {
    this.layer_plugins = options.layer_plugins || {};

    this.set('baseLayers', new Backbone.Collection());
    this.set('overlays', new Backbone.Collection());

    var process_layercfg = function(coll, layercfg) {
      var layer_plugin = this.layer_plugins[layercfg.type];
      if (!layer_plugin) {
        return;
      }
      coll.add(new layer_plugin.model(layercfg));
    };
      
    // read defaults from appconfig
    _.each(appconfig.baseLayers, _.bind(process_layercfg, this, this.get('baseLayers')));
    _.each(appconfig.overlays, _.bind(process_layercfg, this, this.get('overlays')));
  }
});

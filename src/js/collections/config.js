var Backbone = require('backbone');

module.exports = Backbone.Collection.extend({
  model: function(attrs, opts) {
    var Model = Backbone.Model;
    var plugins = require('../plugins');
    var plugin = plugins[attrs.plugin];
    if (plugin.model) {
      Model = plugin.model;
    }
    var model = new Model(attrs, opts);
    model.plugin = plugin;
    return model;
  }
});

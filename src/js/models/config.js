var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
  initialize: function(attributes) {
    this.baseLayersModel = new (require('./configBaseLayers'))(attributes.baseLayers);
    this.dataLayersModel = new Backbone.Collection(attributes.dataLayers);
  }
});

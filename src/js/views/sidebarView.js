var Backbone = require('backbone');
var _ = require('underscore');
var L = require('leaflet');
var config = require('../../../config.json');

// pass 'collection' and 'el' to constructor (gets stored automatically)
module.exports = Backbone.View.extend({
  initialize: function() {
    this.render();
  },
  render: function () {
    var template = require('templates').sidebarView;
    this.$el.html(template());
    return this;
  }
});

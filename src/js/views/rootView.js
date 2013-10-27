var Backbone = require('backbone');
var config = require('../../../config.json');
var SidebarView = require('./sidebarView');
var MapView = require('./mapView');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.router = options.router;
    this.render();
  },
  render: function () {
    var template = require('templates').rootView;
    this.$el.html(template({title: config.title}));
    this.$('a.about').on('click', function() {
      this.$('div.about').modal();
      return false;
    }.bind(this) );
    this.sidebarView = new SidebarView({el: this.$('.lm-sidebar')});
    this.mapView = new MapView({el: this.$('.lm-map'), router: this.router});
    return this;
  }
});

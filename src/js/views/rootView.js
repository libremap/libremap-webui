var Backbone = require('backbone');
var config = require('../../../config.json');

module.exports = Backbone.View.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var template = require('templates').rootView;
    this.$el.html(template({title: config.title}));
    this.$('a.about').on('click', function() {
      this.$('div.about').modal();
      return false;
    }.bind(this) );
    return this;
  }
});

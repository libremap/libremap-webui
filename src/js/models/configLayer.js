var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  initialize: function(attributes) {
    this.set('options', new Backbone.Model(attributes.options));
  }
});

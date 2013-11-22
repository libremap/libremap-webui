var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
  initialize: function(attributes, options) {
    this.config = options.config || require('../../../config.json');
    this.set('api_url', this.config.api_url);
    console.log(this.get('api_url'));
  }
});

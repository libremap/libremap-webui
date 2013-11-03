var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
  initialize: function(attributes, options) {
    this.set('api_url', options.appconfig.api_url);
    console.log(this.get('api_url'));
  }
});

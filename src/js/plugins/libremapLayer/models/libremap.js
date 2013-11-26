var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  defaults: {
    api_url: 'http://libremap.net/api',
    fine_max: 100
  }
});

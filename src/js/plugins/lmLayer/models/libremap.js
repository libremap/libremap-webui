var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  defaults: {
    api_url: 'http://libremap.net/api',
    fine_max: 100,
    show_routers: true,
    show_links: true
  }
});

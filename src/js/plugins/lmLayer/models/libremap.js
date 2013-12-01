var Backbone = require('backbone');
var _ = require('underscore');

var RoutersConfigModel = Backbone.Model.extend({
  defaults: {
    "cluster": true,
    "filter_mode": "or"
  },
  initialize: function(attrs) {
    var ConfigColl = require('../../../collections/config');
    this.set('filters', new ConfigColl(attrs.filters));
  }
});

var LinksConfigModel = Backbone.Model.extend({
  defaults: {
    "filter_mode": "or"
  },
  initialize: function(attrs) {
    var ConfigColl = require('../../../collections/config');
    this.set('filters', new ConfigColl(attrs.filters));
  }
});

module.exports = Backbone.Model.extend({
  defaults: {
    api_url: 'http://libremap.net/api',
    fine_max: 100,
    show_routers: true,
    show_links: true
  },
  initialize: function(attrs) {
    this.set('routers', new RoutersConfigModel(attrs.routers));
    this.set('links', new LinksConfigModel(attrs.links));
  }
});

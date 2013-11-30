var Backbone = require('backbone');
var _ = require('underscore');

var FiltersModel = {
  test: function(model) {
    var filters = this.get('filters').where({enabled: true});
    var mode = this.get('filter_mode');
    var comp = (mode=='and') ? _.every : _.some;
    return comp(filters, function(filter) {
      return filter.test(model);
    });
  }
};

var RoutersConfigModel = Backbone.Model.extend(_.extend({},
  FiltersModel,
  {
    defaults: {
      "cluster": true,
      "filter_mode": "or"
    },
    initialize: function(attrs) {
      var ConfigColl = require('../../../collections/config');
      this.set('filters', new ConfigColl(attrs.filters));
    }
  }
));

var LinksConfigModel = Backbone.Model.extend(_.extend({},
  FiltersModel,
  {
    defaults: {
      "filter_mode": "or"
    },
    initialize: function(attrs) {
      var ConfigColl = require('../../../collections/config');
      this.set('filters', new ConfigColl(attrs.filters));
    }
  }
));

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

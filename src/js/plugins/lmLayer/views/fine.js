var Backbone = require('backbone');
var FilterColl = require('../collections/filter');
var RoutersView = require('./routers');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.proxyView = options.proxyView;
    this.configModel = options.LibreMapModel;

    this.routersColl = new FilterColl(null, {
      supersetColl: this.collection,
      filtersColl: this.configModel.get('routers').get('filters'),
      configModel: this.configModel.get('routers')
    });
    this.listenTo(this.configModel,
      'change:show_routers change:show_links',
      this.render);
    this.render();
  },
  render: function() {
    var show_routers = this.configModel.get('show_routers');
    if (show_routers && !this.routersView) {
      this.routersView = new RoutersView({
        proxyView: this.proxyView,
        collection: this.routersColl,
        configModel: this.configModel.get('routers')
      });
    }
    if (!show_routers && this.routersView) {
      this.removeRoutersView();
    }
  },
  removeRoutersView: function() {
    if (this.routersView) {
      this.routersView.remove();
      this.routersView = undefined;
    }
  },
  remove: function() {
    this.removeRoutersView();
    Backbone.View.prototype.remove.call(this);
  }
});

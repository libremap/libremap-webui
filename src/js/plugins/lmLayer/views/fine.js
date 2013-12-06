var Backbone = require('backbone');
var FilterColl = require('../collections/filter');
var LinksColl = require('../collections/links');
var RoutersView = require('./routers');
var LinksView = require('./links');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.proxyView = options.proxyView;
    this.configModel = options.LibreMapModel;

    // filtered routers
    this.routersColl = new FilterColl(null, {
      supersetColl: this.collection,
      filtersColl: this.configModel.get('routers').get('filters'),
      configModel: this.configModel.get('routers')
    });

    // links based on filtered routers
    this.linksColl = new LinksColl(null, {
      routersColl: this.routersColl
    });

    this.listenTo(this.configModel,
      'change:show_routers change:show_links',
      this.render);
    this.render();
  },
  render: function() {
    // routers
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
    // links
    var show_links = this.configModel.get('show_links');
    if (show_links && !this.linksView) {
      this.linksView = new LinksView({
        proxyView: this.proxyView,
        collection: this.linksColl,
        configModel: this.configModel.get('links')
      });
    }
    if (!show_links && this.linksView) {
      this.removeLinksView();
    }
  },
  removeRoutersView: function() {
    if (this.routersView) {
      this.routersView.remove();
      this.routersView = undefined;
    }
  },
  removeLinksView: function() {
    if (this.linksView) {
      this.linksView.remove();
      this.linksView = undefined;
    }
  },
  remove: function() {
    this.removeRoutersView();
    this.removeLinksView();
    Backbone.View.prototype.remove.call(this);
  }
});

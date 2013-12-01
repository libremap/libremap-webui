var Backbone = require('backbone');

var AliasModel = Backbone.Model.extend({
});

var AliasesColl = Backbone.Collection.extend({
  model: AliasModel,
  initialize: function(models, options) {
    this.routersColl = options.routersColl;

    this.listenTo(this.routersColl, {
      'add': this.addRouter,
      'remove': this.removeRouter,
      'change': function(model) {
        // TODO: finer granularity with change/add/remove/reset events
        // on collection
        this.removeRouter(model);
        this.addRouter(model);
      }
    });
    this.update();
  },
  addRouter: function(model) {
    var aliases = model.get('aliases');
    if (aliases) {
      aliases.each(function(alias) {
        this.add(_.extend({}, alias.toJSON(), { router_id: model.id }));
      }.bind(this));
    }
  },
  removeRouter: function(model) {
    this.remove(this.where({ router_id: model.id }));
  },
  update: function() {
    this.routersColl.each(this.addRouter.bind(this));
  }
});


var LinkModel = Backbone.Model.extend({
});

module.exports = Backbone.Collection.extend({
  model: LinkModel,
  initialize: function(models, options) {
    // the collection of routers from which the links are pulled
    this.routersColl = options.routersColl;

    AA = this.aliasesColl = new AliasesColl(null, {
      routersColl: this.routersColl
    });

    this.incompleteLinks = new Backbone.Collection();

    //this.update();
  },
  /*
  addRouter: function(model) {
    var links = model.get('links');
    if (links) {
      links.each(function(link) {
*/
});

var Backbone = require('backbone');

var AliasModel = Backbone.Model.extend({
});

var AliasColl = Backbone.Collection.extend({
  model: AliasModel,
  initialize: function(models, options) {
    this.refColl = options.refColl;

    this.listenTo(this.refColl, {
      'add': this.addRouter,
      'remove': this.removeRouter,
      'change:aliases': function(model) {
        this.removeRouter(model);
        this.addRouter(model);
      }
    });
  },
  addRouter: function(model) {
    var aliases = model.get('aliases');
    _.each(aliases, function(alias) {
      this.add(_.extend(alias, { router_id: model.id }));
    }.bind(this));
  },
  removeRouter: function(model) {
    this.remove(this.where({ router_id: model.id }));
  }
});


var LinkModel = Backbone.Model.extend({

});

module.exports = Backbone.Collection.extend({
  model: LinkModel,
  initialize: function(models, options) {
    // the collection of routers from which the links are pulled
    this.routersColl = options.routersColl;

    //this.aliasesColl = new Backbone.Collection;

    this.update();
  },

});

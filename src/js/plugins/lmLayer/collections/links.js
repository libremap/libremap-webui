var Backbone = require('backbone');
var LinkModel = require('../models/link');

module.exports = Backbone.Collection.extend({
  model: LinkModel,
  initialize: function(models, options) {
    // the collection of routers from which the links are pulled
    this.routersColl = options.routersColl;
    // aliasesColl holds all aliases of the routers in the routersColl
    this.aliasesColl = new Backbone.Collection();
    // awaitingLinks holds all links of the routers in the routersColl.
    // if a new router is added to routersColl, the aliasesColl and
    // awaitingLinks have to be checked for matches
    this.awaitingLinks = new Backbone.Collection();

    this.listenTo(this.routersColl, {
      add: this.addRouter,
      remove: this.removeRouter,
      change: function(model) {
        // TODO: finer granularity with change/add/remove/reset events
        // on collection
        this.removeRouter(model);
        this.addRouter(model);
      }
    });

    this.update();
  },
  addRouter: function(model) {
    // process aliases
    var aliases = model.get('aliases');
    if (aliases) {
      _.each(aliases, function(alias) {
        // add alias to aliasesColl
        this.aliasesColl.add(_.extend({}, alias, {
          routerId: model.id, // helps when removing
          routerModel: model
        }));
        // check if another router already announced a link to this router
        var awaiting_matches = this.awaitingLinks.where({
          type: alias.type,
          alias_remote: alias.alias
        });
        // add found links (all links are new since the router is new)
        _.each(awaiting_matches, function(awaiting) {
          this.add({
            type: alias.type,
            alias1: alias.alias,
            alias2: awaiting.get('alias_local'),
            routerId1: model.id,
            routerId2: awaiting.get('routerId'),
            routerModel1: model,
            routerModel2: awaiting.get('routerModel'),
            quality1: undefined,
            quality2: awaiting.get('quality'),
            attributes1: undefined,
            attributes2: awaiting.get('attributes')
          });
        }.bind(this));
      }.bind(this));
    }
    // add links
    var links = model.get('links');
    if (links) {
      _.each(links, function(link) {
        // add to awaiting links
        this.awaitingLinks.add(_.extend(_.deepClone(link), {
          routerId: model.id,
          routerModel: model
        }));
        // check matching aliases
        var alias_matches = this.aliasesColl.where({
          type: link.type,
          alias: link.alias_remote
        });
        _.each(alias_matches, function (alias) {
          // have we added the link above?
          var present = this.findWhere({
            type: link.type,
            alias1: link.alias_local,
            alias2: link.alias_remote,
            routerId1: model.id,
            routerId2: alias.get('routerId')
          });
          if (present) {
            present.set({
              quality1: link.quality,
              attributes1: link.attributes
            });
            return;
          }
          // was the link added when processing the remote side?
          present = this.findWhere({
            type: link.type,
            alias1: link.alias_remote,
            alias2: link.alias_local,
            routerId1: alias.get('routerId'),
            routerId2: model.id
          });
          if (present) {
            present.set({
              quality2: link.quality,
              attributes2: link.attributes
            });
            return;
          }
          // if link was not found: add it!
          this.add({
            type: link.type,
            alias1: link.alias_local,
            alias2: link.alias_remote,
            routerId1: model.id,
            routerId2: alias.get('routerId'),
            routerModel1: model,
            routerModel2: alias.get('routerModel'),
            quality1: link.quality,
            quality2: undefined,
            attributes1: link.attributes,
            attributes2: undefined
          });
        }.bind(this));
      }.bind(this));
    }
  },
  removeRouter: function(model) {
    // delete links
    this.remove(this.where({routerId1: model.id}));
    this.remove(this.where({routerId2: model.id}));
    // delete awaiting links
    this.awaitingLinks.remove(this.awaitingLinks.where({routerId: model.id}));
    // delete aliases
    this.aliasesColl.remove(this.aliasesColl.where({ routerId: model.id }));
  },
  update: function() {
    // add all routers in routersColl
    this.routersColl.each(this.addRouter.bind(this));
  }
});

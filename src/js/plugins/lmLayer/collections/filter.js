var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.Collection.extend({
  initialize: function(models, options) {
    // the collection from which we sync
    this.supersetColl = options.supersetColl;
    // collection of filters
    // the models in this collection should have a test(model) method
    // where model is from the supersetColl
    this.filtersColl = options.filtersColl;
    // the configModel is only used to retrieve the logical operator.
    // the model should have a 'mode' attribute (either 'and' or 'or')
    this.configModel = options.configModel;

    this.listenTo(this.supersetColl, {
      add: this.update_model,
      change: this.update_model,
      remove: this.remove,
      reset: this.update
    });
    this.listenTo(this.filtersColl, 'add remove change reset', this.update);
    this.listenTo(this.configModel, 'change:filter_mode', this.update);

    // call super
    Backbone.Collection.prototype.initialize.apply(this, arguments);

    this.update();
  },
  test: function(model) {
    var filters = this.filtersColl.where({enabled: true});
    if (!_.size(filters)) {
      return true;
    }
    var comp = (this.configModel.get('filter_mode')=='and') ? _.every : _.some;
    return comp(filters, function(filter) {
      return filter.test(model);
    });
  },
  update_model: function(model) {
    if (this.test(model)) {
      this.add(model, {merge: true});
    } else {
      this.remove(model);
    }
  },
  update: function() {
    this.set(this.supersetColl.filter(this.test.bind(this)));
  },
  disconnect: function() {
    this.stopListening();
  }
});

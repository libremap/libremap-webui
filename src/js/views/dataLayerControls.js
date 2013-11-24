var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.View.extend({
  initialize: function() {
    this.subviews = {};
    this.listenTo(this.collection, 'add', this.addModel, this);
    this.listenTo(this.collection, 'add', this.removeModel, this);
    this.render();
  },
  addModel: function(model) {
    var View = model.plugin.controlView;
    if (View) {
      this.subviews[model.id] = new View({
        model: model
      });
      this.subviews[model.id].$el.appendTo(this.$el);
    }
  },
  removeModel: function(model) {
    if (this.subviews[model.id]) {
      this.subviews[model.id].remove();
      delete this.subviews[model.id];
    }
  },
  render: function() {
    this.collection.each(this.addModel, this);
  },
  remove: function() {
    _.each(this.subviews, function(val) {
      val.remove();
    });
    this.subviews = {};
  }
});

var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.mapView = options.mapView;
    this.subviews = {};
    this.listenTo(this.collection, 'add', this.addModel, this);
    this.listenTo(this.collection, 'remove', this.removeModel, this);
    this.render();
  },
  render: function() {
    this.collection.each(this.addModel, this);
  },
  addModel: function(model) {
    var View = model.plugin.view;
    if (View) {
      this.subviews[model.id] = new View({
        model: model,
        mapView: this.mapView
      });
    }
  },
  removeModel: function(model) {
    if (this.subviews[model.id]) {
      this.subviews[model.id].remove();
      delete this.subviews[model.id];
    }
  },
  removeSubviews: function() {
    _.each(this.subviews, function(val) {
      val.remove();
    });
    this.subviews = {};
  },
  remove: function() {
    this.removeSubviews();
    Backbone.View.prototype.remove.call(this);
  }
});

var Backbone = require('backbone');

/* BaseLayersView
 *
 * requires a BaseLayersModel as this.model and a mapView in options.
 */
module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.mapView = options.mapView;
    this.listenTo(this.model, 'change', this.render, this);
    this.render();
  },
  render: function() {
    this.removeSubview();
    var layerModel = this.model.coll.get(this.model.get('active_id'));
    var plugins = require('../plugins');
    var plugin = plugins[layerModel.get('plugin')];
    if (plugin.view) {
      this.subview = new (plugin.view)({
        model: layerModel,
        mapView: this.mapView
      });
    }
    return this;
  },
  removeSubview: function() {
    if (this.subview) {
      this.subview.remove();
      this.subview = undefined;
    }
  },
  remove: function() {
    this.removeSubview();
    Backbone.View.prototype.remove.call(this);
  }
});

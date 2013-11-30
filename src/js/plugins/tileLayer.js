var Backbone = require('backbone');

module.exports = {
  type: ['baseLayer', 'overlayLayer'],
  model: Backbone.Model.extend({
    initialize: function(attributes) {
      this.set('options', new Backbone.Model(attributes.options));
    }
  }),
  view: Backbone.View.extend({
    initialize: function(options) {
      this.mapView = options.mapView;
      this.listenTo(this.model, 'change', this.render, this);
      this.listenTo(this.model.get('options'), 'change', this.render, this);
      this.render();
    },
    render: function() {
      this.removeLayer();
      this.layer = L.tileLayer(
        this.model.get('url'),
        this.model.get('options').toJSON()
      ).addTo(this.mapView.map);
    },
    removeLayer: function() {
      if (this.layer) {
        this.mapView.map.removeLayer(this.layer);
      }
    },
    remove: function() {
      this.removeLayer();
      Backbone.View.prototype.remove.call(this);
    }
  }),
  controlView: undefined
};

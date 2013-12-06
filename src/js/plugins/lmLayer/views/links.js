Backbone = require('backbone');
_ = require('underscore');
L = require('leaflet');

var LinkView = Backbone.View.extend({
  initialize: function(options) {
    this.layer = options.layer;
    this.render();
  },
  render: function() {
    console.log(this.model);
    var router1 = this.model.get('routerModel1');
    var router2 = this.model.get('routerModel2');
    this.line = L.polyline([
      [router1.get('lat'), router1.get('lon')],
      [router2.get('lat'), router2.get('lon')]]).addTo(this.layer);
  },
  remove: function() {
    if (this.line) {
      this.layer.removeLayer(this.line);
    }
  }
});

module.exports = Backbone.View.extend({
  View: LinkView,
  initialize: function(options) {
    this.proxyView = options.proxyView;
    this.layer = L.layerGroup().addTo(this.proxyView.mapView.map);

    this.subviews = {};
    this.listenTo(this.collection, {
      add: this.addLink,
      remove: function(model) { this.removeLink(model.cid); },
      reset: this.render
    });
    this.render();
  },
  render: function(){
    this.collection.each(this.addLink, this);
    return this;
  },
  addLink: function(model) {
    this.removeLink(model.cid);
    this.subviews[model.cid] = new this.View({
      layer: this.layer,
      model: model
    });
  },
  removeLink: function(id) {
    if (this.subviews[id]) {
      this.subviews[id].remove();
      delete this.subviews[id];
    }
  },
  removeSubviews: function() {
    _.each(this.subviews, function(subview, id) {
      this.removeLink(id);
    }, this);
    this.proxyView.mapView.map.removeLayer(this.layer);
  },
  remove: function() {
    this.removeSubviews();
    Backbone.View.prototype.remove.call(this);
  }
});

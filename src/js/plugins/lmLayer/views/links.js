Backbone = require('backbone');
_ = require('underscore');
L = require('leaflet');


var LinkView = Backbone.View.extend({
  initialize: function(options) {
    this.layer = options.layer;
    this.listenTo(this.model, 'change', this.render());
    this.render();
  },
  colors: ['#D50000', '#D5A200', '#CCD500', '#00D500'],
  getColorIndex: function(val) {
    var index = Math.floor( this.colors.length * val );
    return Math.max(0, Math.min(this.colors.length-1, index));
  },
  getColor: function(val) {
    return this.colors[this.getColorIndex(val)];
  },
  template: require('templates').lmLinkPopup,
  render: function() {
    this.removeLine();
    var router1 = this.model.get('routerModel1');
    var router2 = this.model.get('routerModel2');
    var quality = this.model.get('quality1');
    if (this.model.get('quality2')!== undefined && router1.get('mtime')<router2.get('mtime')) {
      quality = this.model.get('quality2');
    }
    this.line = L.polyline([
      [router1.get('lat'), router1.get('lon')],
      [router2.get('lat'), router2.get('lon')]],
      {
        color: this.getColor(quality),
        opacity: 0.25 + 0.5*quality
      }).addTo(this.layer).bindPopup(
        L.popup().setContent(this.template(_.extend(this.model.pick(
            'type', 'alias1', 'alias2', 'quality1', 'quality2'
          ), {
            hostname1: router1.get('hostname'),
            hostname2: router2.get('hostname'),
            quality1ColorIndex: this.getColorIndex(this.model.get('quality1')||0),
            quality2ColorIndex: this.getColorIndex(this.model.get('quality2')||0)
          }
        )))
      );
  },
  removeLine: function() {
    if (this.line) {
      this.layer.removeLayer(this.line);
    }
  },
  remove: function() {
    this.removeLine();
    Backbone.View.prototype.remove.call(this);
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

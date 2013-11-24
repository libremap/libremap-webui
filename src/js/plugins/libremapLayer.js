var ProxyModel = require('couchmap-backbone/models/proxy');
var ProxyView = require('couchmap-leaflet/views/proxy');
var Backbone = require('backbone');

var RouterModel = Backbone.Model.extend({
  idAttribute: '_id',
});

var LibreMapModel = ProxyModel.extend({
  initialize: function(attributes, options) {
    var api_url = options.api_url;

    ProxyModel.prototype.initialize.call(this, null, {
      CoarseCollOptions: {
        url: api_url+'/routers_coarse',
        changes_url: api_url+'/db/_changes',
        changes_filter: 'libremap-api/by_id_or_bbox'
      },
      FineCollOptions: {
        model: RouterModel,
        url: api_url+'/routers_by_location',
        changes_url: api_url+'/db/_changes',
        changes_filter: 'libremap-api/by_id_or_bbox'
      }
    });
  }
});

module.exports = {
  type: 'dataLayer',
  model: Backbone.Model,
  view: Backbone.View.extend({
    initialize: function(options) {
      this.mapView = options.mapView;
      this.listenTo(this.model, 'change', this.render, this);
      this.render();
    },
    render: function() {
      this.remove();
      var libreMapModel = new LibreMapModel(null, {
        api_url: this.model.get('api_url')
      });
      this.subview = new ProxyView({
        mapView: this.mapView,
        model: libreMapModel
      });
      return this;
    },
    remove: function() {
      if (this.subview) {
        this.subview.remove();
        this.subview = undefined;
      }
    }
  }),
  controlView: undefined
};

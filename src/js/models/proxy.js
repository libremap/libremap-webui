var ProxyModel = require('couchmap-backbone/models/proxy');

module.exports = ProxyModel.extend({
  initialize: function(attributes, options) {
    var api_url = options.configModel.get('api_url');

    ProxyModel.prototype.initialize.call(this, null, {
      CoarseCollOptions: {
        url: api_url+'/routers_coarse',
        changes_url: api_url+'/db/_changes',
        changes_filter: 'libremap-api/by_id_or_bbox'
      }
    });
  }

});

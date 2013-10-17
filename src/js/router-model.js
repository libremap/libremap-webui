LibreMap.Router = Backbone.Model.extend({
  urlRoot: '/api/router/',
  idAttribute: '_id'
});

LibreMap.RouterStripped = Backbone.Model.extend({
  idAttribute: '_id'
});

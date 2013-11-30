var Backbone = require('backbone');

module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      var attrs = model.get('attributes');
      return attrs && attrs.ap;
    }
  })
};

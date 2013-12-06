var Backbone = require('backbone');

module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      return model.get('attributes.ap');
    }
  })
};

var Backbone = require('backbone');
var NumberView = require('../../../views/number');

module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      var then = new Date(model.get('mtime'));
      var now = new Date();
      return now - then <= 3600*24*1000*this.get('val');
    }
  }),
  controlView: NumberView.extend({
    placeholder: 'Time since update (days)'
  })
};

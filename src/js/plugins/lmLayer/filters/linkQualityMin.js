var Backbone = require('backbone');
var _ = require('underscore');
var NumberView = require('../../../views/number');

module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      var max = model.get('quality1');
      var quality2 = model.get('quality2');
      if (quality2) {
        max = _.max([max,quality2]);
      }
      return max >= this.get('val');
    }
  }),
  controlView: NumberView.extend({
    placeholder: 'Minimum quality (0-1)'
  })
};

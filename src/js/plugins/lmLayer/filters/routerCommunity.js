
var Backbone = require('backbone');
var BootstrapView = require('../../../views/bootstrap');

module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      return this.model.get('val')==model.get('community');
    }
  }),
  controlView: BootstrapView.extend({
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    template: require('templates').lmFilterRouterCommunity,
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  })
};

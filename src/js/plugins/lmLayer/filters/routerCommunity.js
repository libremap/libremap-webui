
var Backbone = require('backbone');
var BootstrapView = require('../../../views/bootstrap');

module.exports = {
  model: Backbone.Model.extend({
    test: function(model) {
      var attrs = model.get('attributes');
      return attrs && attrs.ap;
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
      this.bindCheckbox('input.lmFilterRouterAP', 'enabled');
      return this;
    }
  })
};

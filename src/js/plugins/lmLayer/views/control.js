var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  initialize: function() {
    this.render();
  },
  template: require('templates').libremapLayerControl,
  bindCheckbox: function(selector, attribute) {
    this.$(selector).change(function(e) {
      this.model.set(attribute, e.target.checked);
    }.bind(this));
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.listenTo(this.model, 'change:api_url', function(model) {
      $('#api_url').val(model.get('api_url'));
    });
    this.$('.configure').on('click', function(e) {
      e.preventDefault();
      this.$('.configuration').slideToggle();
    }.bind(this));
    this.$('.configuration > form').on('submit', function(e) {
      e.preventDefault();
      var vals = {
        api_url: this.$('#api_url').val(),
        fine_max: Number(this.$('#fine_max').val()),
      };
      this.$('.configuration').slideToggle();
      this.model.set(vals);
    }.bind(this));
    this.bindCheckbox('#show_routers', 'show_router');
    this.bindCheckbox('#show_links', 'show_links');
  }
});

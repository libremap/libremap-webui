var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  initialize: function() {
    this.render();
  },
  template: require('templates').libremapLayerControl,
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
      var api_url = this.$('#api_url').val();
      this.$('.configuration').slideToggle();
      this.model.set('api_url', api_url);
    }.bind(this));
  }
});

var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  template: require('templates').baseLayersControl,
  initialize: function() {
    this.listenTo(this.model, 'change', this.render, this);
    this.render();
  },
  render: function() {
    this.$el.empty();
    var active_id = this.model.get('active_id');
    this.model.coll.each(function(model) {
      this.$el.append(this.template({
        id: model.id,
        name: model.get('name'),
        checked: model.id==active_id
      }));
    }, this);
    this.$('input.baseLayers').change(function(e) {
      var new_id = this.$('input.baseLayers:checked').val();
      this.model.set('active_id', new_id);
    }.bind(this));
    return this;
  },
});

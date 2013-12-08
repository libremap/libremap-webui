var BootstrapView = require('./bootstrap');
var _ = require('underscore');

module.exports = BootstrapView.extend({
  initialize: function(options) {
    this.attribute = options.attribute;
    this.choices = options.choices;
    this.name = _.uniqueId('radio_');
    this.render();
  },
  template: require('templates').radio,
  render: function() {
    this.$el.empty();
    _.each(this.choices, function(text, val) {
      this.$el.append(this.template({
        name: this.name,
        val: val,
        text: text,
        checked: val==this.model.get(this.attribute)
      }));
    }, this);
    this.$('input[name='+this.name+']').change(function(e) {
      this.model.set(this.attribute, e.target.value);
    }.bind(this));
    return this;
  }
});

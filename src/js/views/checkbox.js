var BootstrapView = require('./bootstrap');
var _ = require('underscore');

module.exports = BootstrapView.extend({
  initialize: function(options) {
    this.attribute = options.attribute;
    this.text = options.text;
    this.name = _.uniqueId('checkbox_');
    this.render();
  },
  template: require('templates').checkbox,
  render: function() {
    this.$el.html(this.template({
      name: this.name,
      text: this.text,
      checked: this.model.get(this.attribute)
    }));
    this.$('input[name='+this.name+']').change(function(e) {
      this.model.set(this.attribute, e.target.checked);
    }.bind(this));
    return this;
  }
});

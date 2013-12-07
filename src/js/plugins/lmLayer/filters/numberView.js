var BootstrapView = require('../../../views/bootstrap');

module.exports = BootstrapView.extend({
  initialize: function(options) {
    this.render();
  },
  template: require('templates').lmFilterNumber,
  property: 'val',
  placeholder: '',
  render: function() {
    this.$el.html(this.template({
      id: this.property,
      placeholder: this.placeholder,
      val: this.model.get(this.property)
    }));
    this.bindNumber('#'+this.property, this.property);
    return this;
  }
});

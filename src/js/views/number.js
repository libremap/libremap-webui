var BootstrapView = require('./bootstrap');

/* options (either provided by options in initializer or by extending)
  attribute (optional, default 'val'): the model's attribute
  placeholder (optional, default ''): the placeholder in the number field
*/
module.exports = BootstrapView.extend({
  initialize: function(options) {
    _.extend(this, _.pick(options || {}, 'attribute', 'placeholder'));
    this.render();
  },
  template: require('templates').number,
  attribute: 'val',
  placeholder: '',
  render: function() {
    this.$el.html(this.template({
      id: this.attribute,
      placeholder: this.placeholder,
      val: this.model.get(this.attribute)
    }));
    this.bindNumber('#'+this.attribute, this.attribute);
    return this;
  }
});

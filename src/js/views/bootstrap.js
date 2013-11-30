var Backbone = require('backbone');

// a view with bootstrap binding helpers
module.exports = Backbone.View.extend({
  bindCheckbox: function(selector, attribute, toggle_selector) {
    this.listenTo(this.model, 'change:'+attribute, function() {
      this.$(selector).prop('checked', this.model.get(attribute));
    }.bind(this), this);
    this.$(selector).change(function(e) {
      this.model.set(attribute, e.target.checked);
    }.bind(this));
    if (toggle_selector) {
    }
  },
  bindVisibility: function(selector, attribute) {
    var els = this.$(selector);
    els.toggle(this.model.get(attribute));
    this.listenTo(this.model, 'change:'+attribute, function(model) {
      els.slideToggle(model.get(attribute));
    });
  }
});

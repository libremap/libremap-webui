var Backbone = require('backbone');

/* BaseLayersModel
 *
 * has a collection of layers and maintains an 'active_id' of the
 * active layer.
 */
module.exports = Backbone.Model.extend({
  defaults: {
    'active_id': undefined
  },
  initialize: function(attributes, options) {
    this.coll = new (require('../collections/config'))(attributes.layers);
    this.listenTo(this.coll, 'add remove', function(model) {
      if (this.coll.length===0) {
        this.set('active_id', undefined);
      } else if (this.coll.length==1) {
        this.set('active_id', model.id);
      }
    }, this);
    if (this.coll.length>0 && this.get('active_id')===undefined) {
      this.set('active_id', this.coll.at(0).id);
    }
  }
});

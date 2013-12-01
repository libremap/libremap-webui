var Backbone = require('backbone');
var _ = require('underscore');

var ParseModel = Backbone.Model.extend({
  parseSubColl: function(data, attribute, Collection) {
    Collection = Collection || Backbone.Collection;
    if (_.has(data, attribute)) {
      var val = data[attribute];
      data[attribute] = this.get(attribute);
      if (!data[attribute]) {
        data[attribute] = new Collection();
        this.listenTo(data[attribute], 'add remove reset change', function() {
          this.trigger('change', this);
        });
      }
      data[attribute].set(val);
    }
  },
  parseSubModel: function(data, attribute, Model) {
    Model = Model || Backbone.Model;
    if (_.has(data, attribute)) {
      var val = data[attribute];
      data[attribute] = this.get(attribute);
      if (!data[attribute]) {
        data[attribute] = new Model(val, {parse: true});
        this.listenTo(data[attribute], 'change', function() {
          this.trigger('change', this);
        });
      } else {
        data[attribute].set(data[attribute].parse(val));
      }
    }
  }
});

var ParseAllModel = ParseModel.extend({
  parse: function(response) {
    var data = _.clone(response);
    _.each(data, function(val, key) {
      if (_.isArray(val)) {
        this.parseSubColl(data, key, Backbone.Collection.extend({
          model: ParseAllModel
        }));
      } else if (_.isObject(val)) {
        this.parseSubModel(data, key, ParseAllModel);
      }
    }.bind(this));
    return data;
  }
});

module.exports = ParseAllModel.extend({
  idAttribute: '_id'
});

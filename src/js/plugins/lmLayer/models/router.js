var Backbone = require('backbone');
var _ = require('underscore');

var ParseModel = Backbone.Model.extend({
  parseSubColl: function(data, attribute, Collection, Model) {
    Collection = Collection || Backbone.Collection;
    if (_.has(data, attribute)) {
      var val = data[attribute];
      val = _.map(data[attribute], function(el) {
        return new Model(el);
      });
      data[attribute] = this.get(attribute);
      if (!data[attribute]) {
        data[attribute] = new Collection();
        data[attribute].set(val);
        this.listenTo(data[attribute], 'add remove reset change subchange', function() {
          this.trigger('subchange', this);
        });
      } else {
        data[attribute].set(val);
      }
    }
  },
  parseSubModel: function(data, attribute, Model) {
    Model = Model || Backbone.Model;
    if (_.has(data, attribute)) {
      var val = data[attribute];
      data[attribute] = this.get(attribute);
      if (!data[attribute]) {
        data[attribute] = new Model(val, {parse: true});
        this.listenTo(data[attribute], 'change subchange', function() {
          this.trigger('subchange', this);
        });
      } else {
        data[attribute].set(data[attribute].parse(val));
      }
    }
  }
});

var ParseAllModel = ParseModel.extend({
  initialize: function() {
    this.subchange = false;
    this.on('subchange', function() {
      this.subchange = true;
    });
  },
  parse: function(response) {
    var data = _.clone(response);
    _.each(data, function(val, key) {
      var submodel = ParseAllModel;
      if (this.submodels && this.submodels[key]) {
        submodel = this.submodels[key];
      }
      if (_.isArray(val)) {
        this.parseSubColl(data, key, Backbone.Collection.extend({
          model: submodel
        }), submodel);
      } else if (_.isObject(val)) {
        this.parseSubModel(data, key, submodel);
      }
    }.bind(this));
    if (this.subchange) {
      this.subchange = false;
      this.trigger('change', this);
    }
    return data;
  }
});

var AliasModel = ParseAllModel.extend({
  initialize: function(attrs, options) {
    this.set('id', JSON.stringify(this.pick('type','alias')));
  }
});

var LinkModel = ParseAllModel.extend({
  initialize: function(attrs, options) {
    this.set('id', JSON.stringify(this.pick('type','alias')));
  }
});

module.exports = ParseAllModel.extend({
  idAttribute: '_id',
  submodels: {
    aliases: AliasModel,
    links: LinkModel
  }
});

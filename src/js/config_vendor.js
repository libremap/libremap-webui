// include the shimmed modules first
// (they make trouble otherwise)

var Backbone = require('backbone');
// set Backbone's jquery property
Backbone.$ = require('jquery');
var _ = require('underscore');

// patch Backbone.Model.toJSON to also process submodels
// see https://github.com/jashkenas/backbone/issues/483#issuecomment-9929576
Backbone.Model.prototype.toJSON = function() {
  if (this._isSerializing) {
    return this.id || this.cid;
  }
  this._isSerializing = true;
  var json = _.clone(this.attributes);
  _.each(json, function(value, name) {
    if (_.isFunction(value.toJSON)) {
      json[name] = value.toJSON();
    }
  });
  this._isSerializing = false;
  return json;
};
// configure deepClone for Backbone.DeepModel
_.deepClone = function(o) {
  return $.extend(true,{},o);
};

var bootstrap = require('bootstrap');
var L = require('leaflet');
// Leaflet has to know where the images reside
L.Icon.Default.imagePath = 'images/vendor/leaflet';

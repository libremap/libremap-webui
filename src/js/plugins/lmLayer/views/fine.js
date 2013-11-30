var FineView = require('couchmap-leaflet/views/fine');
var Backbone = require('backbone');

module.exports = FineView.extend({
  initialize: function(options) {
    console.log(options);
    FineView.prototype.initialize.apply(this, arguments);
    //TODO
  }
});

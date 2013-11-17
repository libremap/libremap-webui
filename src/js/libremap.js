var $ = require('jquery');
var config = require('../../config.json');

var L = require('leaflet');
// Leaflet has to know where the images reside
L.Icon.Default.imagePath = 'images/vendor/leaflet';

$(document).ready(function() {
  require('./config_vendor');

  // set title
  var title = "LibreMap";
  if (typeof(config.title)!="undefined") {
    title += " – " + config.title;
  }
  document.title = title;

  /*
  var RouterCollection = require('./collections/router');
  var common = require('libremap-common');
  var routers = new RouterCollection(null, {bbox: common.bbox([0,0,60,20])});
  routers.fetch({success: function() {console.log(routers.toJSON())}});
  */

  var Backbone = require('backbone');

  // router fires events
  var LibreMapRouter = Backbone.Router.extend({
    routes: {
      "": "bbox",
      "bbox/:bbox": "bbox"
    }
  });
  var router = new LibreMapRouter();

  var RootView = require('./views/rootView');
  var root = new RootView({el: 'body', router: router});

  Backbone.history.start();
});

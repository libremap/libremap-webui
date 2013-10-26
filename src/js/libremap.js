(function() {
  require('./config_vendor');

  var RouterCollection = require('./collections/router');
  var common = require('libremap-common');
  var routers = new RouterCollection(null, {bbox: common.bbox([0,0,60,20])});
  routers.fetch({success: function() {console.log(routers.toJSON())}});

  var templates = require('templates');
  console.log(templates.MapView({foo: 'bar'}));
})();

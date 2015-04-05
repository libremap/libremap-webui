'use strict';
(function() {

  var angular = require('angular');
  require('angular-bootstrap-tpls'); // provides 'ui.bootstrap' module
  require('angular-route'); // provides 'ngRoute' module
  require('../../tmp/templates.js'); // provides 'templates' module

  var libremap = angular.
    module('libreMap', [
      'ui.bootstrap',
      'ngRoute',
      'templates'
    ]).
    constant('config', require('../../config.json'))
    ;

  require('./controllers')(libremap);
})();


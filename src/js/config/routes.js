'use strict';

module.exports = function(app) {
  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/about', {templateUrl: 'templates/about.html'}).
      when('/', {templateUrl: 'templates/map.html'}).
      otherwise({redirectTo: '/'});
  }]);
};

'use strict';

var angular = require('angular');

module.exports = function(app) {
  app.controller('mapCtrl', [
    '$scope', '$window', '$timeout', '$location', 'config',
    function($scope, $window, $timeout, $location, config) {
      // set up layers
      $scope.layers = angular.copy(config.layers);

      // set initial map center and zoom
      $scope.center = angular.copy(config.center);

      // update location with center parameter
      $scope.$on('centerUrlHash', function(event, centerHash) {
        $location.search({c: centerHash});
      });
    }
  ]);
};

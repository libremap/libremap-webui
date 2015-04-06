'use strict';

var angular = require('angular');

module.exports = function(app) {
  app.controller('mapCtrl', [
    '$scope', '$window', '$timeout', '$location', 'config',
    function($scope, $window, $timeout, $location, config) {
      // set up map
      $scope.map = {
        // layer config
        layers: angular.copy(config.layers),
        // initial map center and zoom
        center: angular.copy(config.center)
      };

      // update location with center parameter
      $scope.$on('centerUrlHash', function(event, centerHash) {
        $location.search({c: centerHash});
      });
    }
  ]);
};

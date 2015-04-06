'use strict';

var angular = require('angular');

module.exports = function(app) {
  app.controller('mapCtrl', [
    '$scope', '$window', '$timeout', '$location', 'config',
    function($scope, $window, $timeout, $location, config) {
      $scope.layers = config.layers;
      $scope.center = angular.copy(config.center);

      $scope.$on('centerUrlHash', function(event, centerHash) {
        $location.search({c: centerHash});
      });
      // take care of resize events
      // TODO: seems to be unnecessary -> remove!
      /*
      var resize = function() {
        $scope.$broadcast('invalidateSize');
      };
      angular.element($window).on('resize', resize);
      $timeout(resize);
      */
    }
  ]);
};

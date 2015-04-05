'use strict';

var angular = require('angular');

module.exports = function(app) {
  app.controller('mapCtrl', [
    '$scope', '$window', '$timeout', function($scope, $window, $timeout) {
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

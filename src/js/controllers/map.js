'use strict';

var _ = require('lodash');
var angular = require('angular');

module.exports = function(app) {
  app.controller('mapCtrl', [
    '$scope', '$window', '$timeout', '$location', '$http', 'config',
    function($scope, $window, $timeout, $location, $http, config) {
      // set up map
      $scope.map = {
        // layer config
        layers: angular.copy(config.layers),
        // initial map center and zoom
        center: angular.copy(config.center),
        markers: {},
      };

      // update location with center parameter
      $scope.$on('centerUrlHash', function(event, centerHash) {
        $location.search({c: centerHash});
      });

      // update data when bounds change
      $scope.$watch('map.bounds', function(bounds) {
        if (!bounds) {return;}

        $http.get(config.apiUrl + '/routers_by_location', {
          params: {
            limit: 100,
            bbox: [
              bounds.southWest.lng,
              bounds.southWest.lat,
              bounds.northEast.lng,
              bounds.northEast.lat
            ].join(',')
          }
        }).success(function(data) {
          var newMarkers = _.zipObject(_.map(data.rows, function(row) {
            var value = row.value;
            var marker = {
              lat: value.lat,
              lng: value.lon,
              message: value.hostname || value._id,
              value: value
            };
            return [value._id, marker];
          }));
          angular.extend($scope.map.markers, newMarkers);
          console.log($scope.map.markers);
        });
      });
    }
  ]);
};

'use strict';
module.exports = function(app) {
  app.controller('navCtrl', ['$scope', 'config', function($scope, config) {
    $scope.collapsed = true;
    $scope.config = config;
  }]);
};

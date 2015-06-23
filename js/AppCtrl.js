(function () {
  'use strict';
  angular.module('MyApp', ['ngMaterial']).controller('AppCtrl', function($scope) {

    $scope.date = new Date().getHours();

  });
})();

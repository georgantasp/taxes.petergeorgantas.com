'use strict';

angular.module('taxes')
.controller('CompareCtrl', [
  '$scope',
  function($scope) {
    
    $scope.showNotes=true;
    
    $scope.$watch('comparables', function(){
      $scope.table_data = $scope.comparables;
    });
  }
]);
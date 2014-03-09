'use strict';

angular.module('taxes',['highcharts-ng'])
.run([
  '$location',
  function($location){
    if($location.$$host == 'taxes.petergeorgantas.com'){
      _gaq.push(['_trackPageview', $location.path()]);
    }
  }
])
.controller('MainCtrl', [
  '$scope', '$http', '$location',
  function($scope, $http, $location){
    $scope.path = $location.path() || '/intro';
    $scope.updatePath = function(newPath){
      $scope.path = newPath;
      $location.path(newPath);
      if($location.$$host == 'taxes.petergeorgantas.com'){
        _gaq.push(['_trackPageview', $location.path()]);
      }
    }
    
    $scope.totalDisplayed = 100;
    
    $scope.home_key = [{
      "block": "22.08",
      "lot": "10",
      "notes": [
        "Assessment raised by 20%",
        "Average assessment of comparables is $283,700"
      ]
    }]
    
    $scope.comparables_key = [{
      "quick_name": "604 Shady Lane",
      "order": 1,
      "block": "29.01",
      "lot": "18",
      "notes": [
        "Similar age",
        "Similar square footage",
        "No reassessment"
      ]
    },{
      "quick_name": "235 Hopkins",
      "block": "15.07",
      "lot": "2",
      "notes": [
        "Similar age",
        "Square footage slightly higher",
        "Acreage is larger by 30%",
        "Higher sale price by $15K",
        "Lower assessment by $7,900",
        "Assessment raised to 0.762 ratio, then lowered to 0.757"
      ]
    },{
      "quick_name": "508 Homestead",
      "block": "15.02",
      "lot": "45",
      "notes": [
        "Similar square footage",
        "Similar lot size",
        "Newer home",
        "Attached two car garage",
        "No reassessment"
      ]
    },{
      "quick_name": "262 Bewley Rd",
      "block": "15.08",
      "lot": "35",
      "notes": [
        "Newer home",
        "Similar lot size",
        "No reassessment"
      ]
    },{
      "quick_name": "419 Albany",
      "block": "22.08",
      "lot": "9",
      "notes": [
        "Next door neighbor",
        "Similar age",
        "Acreage is larger by 65%",
        "Sizable outdoor deck",
        "Inground pool",
      ]
    }];
    
    $scope.neighborhood_key = [{
      "block": "22.07"
    },{
      "block": "22.08"
    },{
      "block": "22.09"
    },{
      "block": "22.10"
    }];
    
    var find_mapped_comparable = function(keys, item){
      return _.find(keys, function(key){
        if(!_.has(key,"lot")){
          return key["block"] == item["block"]
        }
        return key["block"] == item["block"] && key["lot"] == item["lot"];
      });
    };
    
    $scope.$watch('all_data', function(){
      $scope.comparables = _.chain($scope.all_data)
        .filter(function(item){
          return find_mapped_comparable($scope.comparables_key, item);
        }).map(function(item){
          return _.extend({}, item, find_mapped_comparable($scope.comparables_key, item));
        }).value();
        
      $scope.neighborhood = _.chain($scope.all_data)
        .filter(function(item){
          return find_mapped_comparable($scope.neighborhood_key, item);
        }).value();
        
      $scope.home = _.chain($scope.all_data)
        .filter(function(item){
          return find_mapped_comparable($scope.home_key, item);
        }).map(function(item){
          return _.extend({}, item, find_mapped_comparable($scope.home_key, item));
        }).first().value();
    });
    
    $scope.sortData = function(predicate_val){
      if($scope.predicate_val === predicate_val){
        $scope.reverse = !$scope.reverse;
      }else{
        $scope.predicate_val = predicate_val;
        $scope.reverse = true;
      }
    };
    $scope.predicate = function(item){
      return $scope.$eval('predicate_item.' + $scope.predicate_val, {predicate_item: item}) || ($scope.reverse ? -Infinity : Infinity);
    }
    
    var promise = $http({method: 'GET', url: 'json/town.json'});
    promise.success(function(return_data){
      _.each(return_data, function(item){
        if(item.sale_date){
          item.sale_date = moment(item.sale_date, "MM/DD/YY");
        }
      });
      $scope.all_data = return_data;
    });
  }
]);
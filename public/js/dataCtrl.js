angular.module('taxes')
.controller('DataCtrl', [
  '$scope',
  function($scope) {
    
    $scope.chartOptions = {
      y: 'tax_records[\'2014\'].ass',
      x: 'sale_price',
    }
    $scope.chartConfig = {
      series: [{
        type: 'scatter',
        name: 'Series'
      },{
        type: 'line',
        name: 'Average',
        marker: {
          enabled: false
        }
      }, {
        type: 'scatter',
        name: '421 Albany Ave',
        marker: {
          symbol: 'square',
          radius: 5,
          fillColor: '#007F00',
        }
      }],
      options: {
        title: {
          text: null
        },
        loading: false,
        yAxis: {
          title: {
            text: null
          }
        },
        legend: {
          enabled:true 
        },
        tooltip: {
          enabled: false
        },
        credits:{
          enabled:false
        }
      }
    }
    
    $scope.graph_options = [
      {value: 'sq_foot', name: 'Square Feet'},
      {value: 'tax_records[\'2014\'].imp', name: 'Imp 2014'},
      {value: 'tax_records[\'2014\'].imp_psqf', name: 'Imp 2014 p/sqf'},

      {value: 'acreage', name: 'Acreage'},
      {value: 'tax_records[\'2014\'].lnd', name: 'Land 2014'},
      {value: 'tax_records[\'2014\'].lnd_psqf', name: 'Land 2014 p/sqf'},

      {value: 'tax_records[\'2011\'].ass', name: 'Asses 2011'},
      {value: 'tax_records[\'2014\'].ass', name: 'Asses 2014'},
      {value: 'taxes', name: 'Taxes'},
      {value: 'tax_rate', name: 'Tax Rate'},

      {value: 'sale_price', name: 'Sale Price'},
      {value: 'ratio', name: 'Ratio'},
    ];
    
    
    $scope.filter_options = {
      sq_feet: {
        start: 1600,
        end: 2400
      },
      assessment: {
        start: null,
        end: null,
      },
      year_built: {
        start: null,
        end: null,
      },
      sale_price: {
        start: 200000,
        end: 400000
      },
      sale_date: {
        start: null,
        end: null,
        start_moment: null,
        end_moment: null
      }
    };
    
    var data_filter_func = function(start_date, end_date, item){
      var pass =
      (start_date == null || (item.sale_date != null && moment(item.sale_date, "MM/DD/YY").isAfter(start_date)) ) &&
      (  end_date == null || (item.sale_date != null && moment(item.sale_date, "MM/DD/YY").isBefore(end_date)) ) &&
      
      ($scope.filter_options.sale_price.start == null || $scope.filter_options.sale_price.start == "" || (item.sale_price >= $scope.filter_options.sale_price.start)) &&
      ($scope.filter_options.sale_price.end   == null || $scope.filter_options.sale_price.end   == "" || (item.sale_price <= $scope.filter_options.sale_price.end)) &&
      
      ($scope.filter_options.sq_feet.start == null || $scope.filter_options.sq_feet.start == "" || (item.sq_foot >= $scope.filter_options.sq_feet.start)) &&
      ($scope.filter_options.sq_feet.end   == null || $scope.filter_options.sq_feet.end   == "" || (item.sq_foot <= $scope.filter_options.sq_feet.end)) &&
      
      ($scope.filter_options.assessment.start == null || $scope.filter_options.assessment.start == "" || (item.tax_records['2014'].ass >= $scope.filter_options.assessment.start)) &&
      ($scope.filter_options.assessment.end   == null || $scope.filter_options.assessment.end   == "" || (item.tax_records['2014'].ass <= $scope.filter_options.assessment.end)) &&
      
      ($scope.filter_options.year_built.start == null || $scope.filter_options.year_built.start == "" || (item.year_built >= $scope.filter_options.year_built.start)) &&
      ($scope.filter_options.year_built.end   == null || $scope.filter_options.year_built.end   == "" || (item.year_built <= $scope.filter_options.year_built.end))
      ;
      
      
      return pass;
    };
    
    var refresh = _.debounce(function(){
      var start_date = $scope.filter_options.sale_date.start_moment == null ? null : moment.unix($scope.filter_options.sale_date.start_moment);
      var end_date = $scope.filter_options.sale_date.end_moment == null ? null : moment.unix($scope.filter_options.sale_date.end_moment);
      var filtered_data = _.select($scope.all_data, _.partial(data_filter_func, start_date, end_date));
      $scope.$apply(function(){
        $scope.table_data = filtered_data;
      });
    },600);
    
    var refresh_chart = _.debounce(function(){
      if(_.isArray($scope.table_data) && $scope.table_data.length < 1000){
        var chart_data = _.map($scope.table_data, function(item){
          return [$scope.$eval('item.' + $scope.chartOptions.x, {item: item}), $scope.$eval('item.' + $scope.chartOptions.y, {item: item})];
        });
        
        var stat_data = _.map(chart_data, function(item){
          if(_.isArray(item)){
            return item;
          }
          return [item.x, item.y];
        });
        var linear = ss.linear_regression().data(stat_data).line();
        var d = _.map(stat_data, function(i){ return i[0]; });
        var std = ss.standard_deviation(d);
        var varience = ss.variance(d);
        var min = _.min(d),
            max = _.max(d);
        
        $scope.$apply(function(){
          $scope.std = std;
          $scope.chartConfig.series[0].data = chart_data;
          $scope.chartConfig.series[1].data = [
            [min, linear(min)],
            [max, linear(max)]
          ];
          $scope.chartConfig.series[2].data = [{
            x: $scope.$eval('item.' + $scope.chartOptions.x, {item: $scope.home}),
            y: $scope.$eval('item.' + $scope.chartOptions.y, {item: $scope.home}),

          }];
        });
      }else{
        $scope.$apply(function(){
          $scope.chartConfig.series[0].data = [];
          $scope.chartConfig.series[1].data = [];
          $scope.chartConfig.series[2].data = [];
        });
      }
    },300);
    
    $scope.$watch('filter_options', function(){
      if($scope.filter_options.sale_date.start && $scope.filter_options.sale_date.start.length == 8){
        $scope.filter_options.sale_date.start_moment = moment($scope.filter_options.sale_date.start, "MM/DD/YY").unix();
      }else{
        $scope.filter_options.sale_date.start_moment = null
      }
      if($scope.filter_options.sale_date.end && $scope.filter_options.sale_date.end.length == 8){
        $scope.filter_options.sale_date.end_moment = moment($scope.filter_options.sale_date.end, "MM/DD/YY").unix();
      }else{
        $scope.filter_options.sale_date.end_moment = null;
      }
      refresh();
    }, true);
    
    $scope.$watch('all_data', function(){
      refresh();
    });
    
    $scope.$watch('chartOptions', function(){
      refresh_chart();
    }, true)
    
    $scope.$watch('table_data', function(){
      refresh_chart();
    });
  }
]);
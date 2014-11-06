app.controller('HomeCtrl',['$scope','$resource' ,function($scope, $resource) {
    //Product request
    function load(skip, limit, kind) {
        var res = $resource('/api');
        return res.query({s: skip ,l: limit, new: kind});
    }

    var pos = 0; //from zero position
    $scope.step = 6; //show only five products per page
    var oldOrNew = 0; //show newly added products only


    $scope.dbClear = function () {
        $resource('/api/clear').query();
        alert('DB cleared!!!');
    };

    //Initial product load
    $scope.products = load(pos,$scope.step,oldOrNew);

    //Select which products to be shown on
    $('#selected').on('change', function(){
        oldOrNew = $('option:selected',$(this)).index();
        pos = 0;
        $scope.products = load(pos,$scope.step,oldOrNew);
    });

    //Preview and Next Buttons
    $scope.prev = function(){
        if (pos >= $scope.step) {
            pos = pos - $scope.step;
            load(pos, $scope.step, oldOrNew).$promise.then(function (result) {
                $scope.products = result;
            });
        };
    };
    $scope.next = function(){
        pos = pos + $scope.step;
        load(pos,$scope.step,oldOrNew).$promise.then(function(result){
            if (result.length === 0) {
                pos = pos - $scope.step;
            }
            else {
                $scope.products = result;
            };
        });
    };
}]);

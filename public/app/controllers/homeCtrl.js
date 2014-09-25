app.controller('HomeCtrl',['$scope','$resource' ,function($scope, $resource) {
    // Showing the Products and dealing with the Prev and Next buttons
    function load(skip, limit, kind) {
        var res = $resource('/api');
        return res.query({s: skip ,l: limit, new: kind});
    }
//    function loadByComment(skip, limit) {
//        var res = $resource('/api/comment');
//        return res.query({s: skip ,l: limit});
//    }
    var pos = 0;
    $scope.step = 3;
    var oldOrNew = 0;

    $('#selected').on('change', function(){
        oldOrNew = $('option:selected',$(this)).index();
        pos = 0;
        $scope.products = load(pos,$scope.step,oldOrNew);
    });


    $scope.products = load(pos,$scope.step,oldOrNew);

    $('#checkNew').on('click',function(){
        oldOrNew = !oldOrNew;
        pos = 0;
        $scope.products = load(pos,$scope.step,oldOrNew);
    });

    $scope.prev = function(){
        pos = pos - $scope.step;
        if (pos < 0){
          pos = 0;
        };
        load(pos,$scope.step,oldOrNew).$promise.then(function(result){
            $scope.products = result;
        });
    };
    $scope.next = function(){
        pos = pos + $scope.step;
        load(pos,$scope.step,oldOrNew).$promise.then(function(result){

            if (result.length === 0) {

                pos = pos - $scope.step;
                $scope.products = load(pos,$scope.step,oldOrNew);
            }
            else {

                $scope.products = result;
            };
        });
    };
}]);

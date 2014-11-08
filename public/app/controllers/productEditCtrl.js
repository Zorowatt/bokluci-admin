app.controller('ProductEditCtrl',['$scope', '$routeParams', '$resource', 'productsCRUD','$modal',
    function($scope, $routeParams, $resource, productsCRUD,$modal) {
    window.scrollTo(0, 0);
    $scope.readyForUpdate = false;


    $scope.showMe = function () {
        var modalInstance = $modal.open({
            templateUrl: '/p/partials/showMe',
            controller: 'ShowMeCtrl'
            //,backdrop: 'static'
            //,keyboard: false
            //,size: 'sm'
            ,resolve: {
                message : function () {
                    return $scope.Product.thumbnail;
                }
            }
        });
        modalInstance.result.then(function (result) {
            if (result == 'close') {
                $modalInstance.dismiss('close');
            }
        });
    };




    var p = $resource('/api/product/:id',{id: $routeParams.id});
    p.get().$promise.then(function(product) {
                $scope.Product = product;
                //$scope.keyWords = product.keyWords.toString();
                //$scope.category = product.category.toString();
                //console.log(typeof product.picture[0].dateAdded);
                //$scope.Product.picture[0].dateAdded = product.picture[0].dateAdded.substring(0,10);

        });

    $scope.rotateLeft = function () {
        $resource('/left/:id',{id: $scope.Product.thumbnail}).get().$promise.then(function(product) {
        alert('Image rotation carried out!!!\nClear the cache to view the new image');

        });
    };







    $scope.changeForUpdate = function () {
        $scope.readyForUpdate = true;
        };
    //Enable/Disable button Update
//    $('#update').prop('disabled', true);
//        $scope.changeForUpdate = function(){
//            $('#update').prop('disabled', false);
//        };
//    $(document).on('input',  function() {
//        $('#update').prop('disabled', false);
//    });

    //Update product
    $scope.updateProduct = function(){
        $scope.readyForUpdate = false;
        //Keywords & Categories
        //$scope.Product.keyWords = $scope.keyWords.split(",");
        //$scope.Product.category = $scope.category.split(",");
        //Keywords & Categories end

        productsCRUD.update($scope.Product);

        //Disable Update button
        //$('#update').prop('disabled', true);

        alert('Всички промени са актуализирани!');


    };

    //Remove product
    $scope.deleteProduct = function () {
        if (confirm('You are about to DELETE the entire Product?')){
            //productsCRUD.delete($scope.Product);
            var p = $resource('/api/delete/:id',{id: $routeParams.id});
            p.get().$promise.then(function(product) {
                //console.log(product);
                //$scope.Product = product;
            });
        }
    };


    //Remove comments
    $scope.removeCommentFromPros = function (ele) {
        //$('#update').prop('disabled', false);
        $scope.readyForUpdate = true;
        var index = $scope.Product.pros.indexOf(ele);
        if (index > -1) {
            $scope.Product.pros.splice(index, 1);
        }

    };
    $scope.removeCommentFromCons = function (ele) {
        //$('#update').prop('disabled', false);
        $scope.readyForUpdate = true;
        var index = $scope.Product.cons.indexOf(ele);
        if (index > -1) {
            $scope.Product.cons.splice(index, 1);
        }

    };

    //before page scape checks for is update made
    $scope.$on('$routeChangeStart', function(next, current) {
        if ($scope.readyForUpdate){
            if (confirm('Има промени, които не са актуализирани!!!\nИзкате ли да бъдат потвърдени?')){
                $scope.updateProduct();
            }
        }
    });
}]);
app.controller('ProductEditCtrl',['$scope', '$routeParams', '$resource', 'productsCRUD',
    function($scope, $routeParams, $resource, productsCRUD) {

    var p = $resource('/api/product/:id',{id: $routeParams.id});
    p.get().$promise.then(function(product) {
                $scope.Product = product;
                $scope.keyWords = product.keyWords.toString();
                $scope.category = product.category.toString();
                //console.log(typeof product.picture[0].dateAdded);
                $scope.Product.picture[0].dateAdded = product.picture[0].dateAdded.substring(0,10);

        });


    //Enable/Disable button Update
    $('#update').prop('disabled', true);
        $scope.changeForUpdate = function(){
            $('#update').prop('disabled', false);
        };
    $(document).on('input',  function() {
        $('#update').prop('disabled', false);
    });

    //Update product
    $scope.updateProduct = function(){
        //Keywords & Categories
        $scope.Product.keyWords = $scope.keyWords.split(",");
        $scope.Product.category = $scope.category.split(",");
        //Keywords & Categories end

        productsCRUD.update($scope.Product);

        //Disable Update button
        $('#update').prop('disabled', true);

        alert('Updated !');


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
        $('#update').prop('disabled', false);
        var index = $scope.Product.pros.indexOf(ele);
        if (index > -1) {
            $scope.Product.pros.splice(index, 1);
        }

    };
    $scope.removeCommentFromCons = function (ele) {
        $('#update').prop('disabled', false);
        var index = $scope.Product.cons.indexOf(ele);
        if (index > -1) {
            $scope.Product.cons.splice(index, 1);
        }

    };

}]);
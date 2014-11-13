app.controller('ProductEditCtrl',['$scope', '$routeParams', '$resource', 'productsCRUD','$modal','$location',
    function($scope, $routeParams, $resource, productsCRUD, $modal, $location) {
    window.scrollTo(0, 0);
    $scope.readyForUpdate = false;
    $scope.onoff=false;

    $scope.showMe = function () {
        if ($scope.onoff){return}
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

        var random = (new Date()).toString();
        $scope.app = {
            imageUrl: "/thumb/"+$scope.Product.thumbnail
        };
        var random = (new Date()).toString();
        $scope.imageSource = $scope.app.imageUrl+'?df='+random;

        });



    $scope.rotateImg = function () {

//        var User  = $resource('/rotateImage/:id', {id: $scope.Product.thumbnail});
//        $scope.myPromise = User.$save();


        if (confirm('Да завъртя ли снимката???')) {
            $scope.onoff = true;
            $scope.myPromise = $resource('/rotateImage/:id', {id: $scope.Product.thumbnail}).get().$promise.then(function (product) {
                //alert('Image rotation carried out!!!\nClear the cache to view the new image');
                //Workaround to force image to reload after rotate been carried out
                $scope.app = {
                    imageUrl: "/thumb/" + $scope.Product.thumbnail
                };
                var random = (new Date()).toString();
                $scope.imageSource = $scope.app.imageUrl + '?df=' + random;
                $scope.onoff = false;
            });
        }
    };
    $scope.removeImg = function () {
        if (confirm('Да премахна ли снимката???')) {
            $scope.onoff = true;
            $scope.myPromise = $resource('/removeImage/:id', {id: $scope.Product.thumbnail}).get().$promise.then(function (product) {
                //Workaround to force image to reload after rotate been carried out
                $scope.app = {
                    imageUrl: "/thumb/" + $scope.Product.thumbnail
                };
                var random = (new Date()).toString();
                $scope.imageSource = $scope.app.imageUrl + '?df=' + random;
                $scope.onoff = false;
            });
        }
    };
    $scope.bannedImg = function () {
        if (confirm('Да забраня/банирам ли снимката???')) {
            $scope.onoff = true;
            $scope.myPromise = $resource('/banImage/:id', {id: $scope.Product.thumbnail}).get().$promise.then(function (product) {
                //Workaround to force image to reload after rotate been carried out

                $scope.app = {
                    imageUrl: "/thumb/" + $scope.Product.thumbnail
                };
                var random = (new Date()).toString();
                $scope.imageSource = $scope.app.imageUrl + '?df=' + random;
                $scope.onoff = false;


            });
        }
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
        productsCRUD.update($scope.Product);
        alert('Всички промени са актуализирани!');
    };

    //Remove product
    $scope.deleteProduct = function () {
        if (confirm('Така ще изтриете цялата тема!!!?')){
            //productsCRUD.delete($scope.Product);
            var p = $resource('/api/delete/:id',{id: $routeParams.id});
            p.get().$promise.then(function(product) {
                //console.log(product);
                //$scope.Product = product;
            });
            $location.path('/');
        }
    };


    //Remove comments
    $scope.removeCommentFromPros = function (ele) {
        if(confirm('Желаете ли да премахнете този коментар?')) {
            $scope.readyForUpdate = true;
            var index = $scope.Product.pros.indexOf(ele);
            if (index > -1) {
                $scope.Product.pros.splice(index, 1);
            }
        }
    };
    $scope.removeCommentFromCons = function (ele) {
        if(confirm('Желаете ли да премахнете този коментар?')) {
            $scope.readyForUpdate = true;
            var index = $scope.Product.cons.indexOf(ele);
            if (index > -1) {
                $scope.Product.cons.splice(index, 1);
            }
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
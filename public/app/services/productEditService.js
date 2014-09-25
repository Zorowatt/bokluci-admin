app.factory('productsCRUD', function($http, $q, $resource) {
    return {
        create: function(product) {

            var deferred = $q.defer();

            var prod = $resource('/api/products/');
            var p = new prod(product);
            //console.log(p);
            p.$save().then(function() {
                //identity.currentUser = user;
                deferred.resolve();
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        },
        delete: function(product) {
            var deferred = $q.defer();
            var prod = $resource('/api/:id', {id: '@_id'}, { remove: {method: 'DELETE', isArray: false}});
            var p = new prod(product);
            //p._id = identity.currentUser._id;
            p.$delete().then(function() {
                //identity.currentUser.firstName = updatedUser.firstName;
                //identity.currentUser.lastName = updatedUser.lastName;
                deferred.resolve();
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        },
        update: function(product) {
            var deferred = $q.defer();
            var prod = $resource('/api/:id', {}, {update: {method: 'PUT', params: {id: '@_id'}}});
            var p = new prod(product);

            p.pros = product.pros;
            p.cons = product.cons;
            p.flagIsNew = product.flagIsNew;

            p.name = product.name;
            p.origin = product.origin;
            p.maker = product.maker;
            p.reseller = product.reseller;
            p.productModel = product.productModel;
            p.keyWords = product.keyWords || 'n/a';
            p.category = product.category || 'n/a';


            p.$update().then(function() {
                deferred.resolve();
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        }
//        login: function(user){
//            var deferred = $q.defer();
//
//            $http.post('/login', user).success(function(response) {
//                if (response.success) {
//                    var user = new UsersResource();
//                    angular.extend(user, response.user);
//                    identity.currentUser = user;
//                    deferred.resolve(true);
//                }
//                else {
//                    deferred.resolve(false);
//                }
//            });
//
//            return deferred.promise;
//        },
//        logout: function() {
//            var deferred = $q.defer();
//
//            $http.post('/logout').success(function() {
//                identity.currentUser = undefined;
//                deferred.resolve();
//            })
//
//            return deferred.promise;
//        },
//        isAuthenticated: function() {
//            if (identity.isAuthenticated()) {
//                return true;
//            }
//            else {
//                return $q.reject('not authorized');
//            }
//        },
//        isAuthorizedForRole: function(role) {
//            if (identity.isAuthorizedForRole(role)) {
//                return true;
//            }
//            else {
//                return $q.reject('not authorized');
//            }
//        }
    }
});

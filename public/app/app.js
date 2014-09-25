var app = angular.module('app',['ngResource','ngRoute','ui.bootstrap']);


app.config(function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/productEdit/:id',{
            templateUrl: '/p/partials/productEdit',
            controller: 'ProductEditCtrl'
        })
        .when('/', {
            templateUrl: '/home',
            controller: 'HomeCtrl'
        })

});






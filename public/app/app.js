var app = angular.module('app',['ngResource','ngRoute','ui.bootstrap','ngCookies']);


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


app.constant('msdElasticConfig', {
    append: ''
});
app.directive('msdElastic', [
    '$timeout', '$window', 'msdElasticConfig',
    function($timeout, $window, config) {
        'use strict';

        return {
            require: 'ngModel',
            restrict: 'A, C',
            link: function(scope, element, attrs, ngModel) {

                // cache a reference to the DOM element
                var ta = element[0],
                    $ta = element;

                // ensure the element is a textarea, and browser is capable
                if (ta.nodeName !== 'TEXTAREA' || !$window.getComputedStyle) {
                    return;
                }

                // set these properties before measuring dimensions
                $ta.css({
                    'overflow': 'hidden',
                    'overflow-y': 'hidden',
                    'word-wrap': 'break-word'
                });

                // force text reflow
                var text = ta.value;
                ta.value = '';
                ta.value = text;

                var append = attrs.msdElastic ? attrs.msdElastic.replace(/\\n/g, '\n') : config.append,
                    $win = angular.element($window),
                    mirrorInitStyle = 'position: absolute; top: -999px; right: auto; bottom: auto;' +
                        'left: 0; overflow: hidden; -webkit-box-sizing: content-box;' +
                        '-moz-box-sizing: content-box; box-sizing: content-box;' +
                        'min-height: 0 !important; height: 0 !important; padding: 0;' +
                        'word-wrap: break-word; border: 0;',
                    $mirror = angular.element('<textarea tabindex="-1" ' +
                        'style="' + mirrorInitStyle + '"/>').data('elastic', true),
                    mirror = $mirror[0],
                    taStyle = getComputedStyle(ta),
                    resize = taStyle.getPropertyValue('resize'),
                    borderBox = taStyle.getPropertyValue('box-sizing') === 'border-box' ||
                        taStyle.getPropertyValue('-moz-box-sizing') === 'border-box' ||
                        taStyle.getPropertyValue('-webkit-box-sizing') === 'border-box',
                    boxOuter = !borderBox ? {width: 0, height: 0} : {
                        width:  parseInt(taStyle.getPropertyValue('border-right-width'), 10) +
                            parseInt(taStyle.getPropertyValue('padding-right'), 10) +
                            parseInt(taStyle.getPropertyValue('padding-left'), 10) +
                            parseInt(taStyle.getPropertyValue('border-left-width'), 10),
                        height: parseInt(taStyle.getPropertyValue('border-top-width'), 10) +
                            parseInt(taStyle.getPropertyValue('padding-top'), 10) +
                            parseInt(taStyle.getPropertyValue('padding-bottom'), 10) +
                            parseInt(taStyle.getPropertyValue('border-bottom-width'), 10)
                    },
                    minHeightValue = parseInt(taStyle.getPropertyValue('min-height'), 10),
                    heightValue = parseInt(taStyle.getPropertyValue('height'), 10),
                    minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height,
                    maxHeight = parseInt(taStyle.getPropertyValue('max-height'), 10),
                    mirrored,
                    active,
                    copyStyle = ['font-family',
                        'font-size',
                        'font-weight',
                        'font-style',
                        'letter-spacing',
                        'line-height',
                        'text-transform',
                        'word-spacing',
                        'text-indent'];

                // exit if elastic already applied (or is the mirror element)
                if ($ta.data('elastic')) {
                    return;
                }

                // Opera returns max-height of -1 if not set
                maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;

                // append mirror to the DOM
                if (mirror.parentNode !== document.body) {
                    angular.element(document.body).append(mirror);
                }

                // set resize and apply elastic
                $ta.css({
                    'resize': (resize === 'none' || resize === 'vertical') ? 'none' : 'horizontal'
                }).data('elastic', true);

                /*
                 * methods
                 */

                function initMirror() {
                    var mirrorStyle = mirrorInitStyle;

                    mirrored = ta;
                    // copy the essential styles from the textarea to the mirror
                    taStyle = getComputedStyle(ta);
                    angular.forEach(copyStyle, function(val) {
                        mirrorStyle += val + ':' + taStyle.getPropertyValue(val) + ';';
                    });
                    mirror.setAttribute('style', mirrorStyle);
                }

                function adjust() {
                    var taHeight,
                        taComputedStyleWidth,
                        mirrorHeight,
                        width,
                        overflow;

                    if (mirrored !== ta) {
                        initMirror();
                    }

                    // active flag prevents actions in function from calling adjust again
                    if (!active) {
                        active = true;

                        mirror.value = ta.value + append; // optional whitespace to improve animation
                        mirror.style.overflowY = ta.style.overflowY;

                        taHeight = ta.style.height === '' ? 'auto' : parseInt(ta.style.height, 10);

                        taComputedStyleWidth = getComputedStyle(ta).getPropertyValue('width');

                        // ensure getComputedStyle has returned a readable 'used value' pixel width
                        if (taComputedStyleWidth.substr(taComputedStyleWidth.length - 2, 2) === 'px') {
                            // update mirror width in case the textarea width has changed
                            width = parseInt(taComputedStyleWidth, 10) - boxOuter.width;
                            mirror.style.width = width + 'px';
                        }

                        mirrorHeight = mirror.scrollHeight;

                        if (mirrorHeight > maxHeight) {
                            mirrorHeight = maxHeight;
                            overflow = 'scroll';
                        } else if (mirrorHeight < minHeight) {
                            mirrorHeight = minHeight;
                        }
                        mirrorHeight += boxOuter.height;

                        ta.style.overflowY = overflow || 'hidden';

                        if (taHeight !== mirrorHeight) {
                            ta.style.height = mirrorHeight + 'px';
                            scope.$emit('elastic:resize', $ta);
                        }

                        // small delay to prevent an infinite loop
                        $timeout(function() {
                            active = false;
                        }, 1);

                    }
                }

                function forceAdjust() {
                    active = false;
                    adjust();
                }

                /*
                 * initialise
                 */

                // listen
                if ('onpropertychange' in ta && 'oninput' in ta) {
                    // IE9
                    ta['oninput'] = ta.onkeyup = adjust;
                } else {
                    ta['oninput'] = adjust;
                }

                $win.bind('resize', forceAdjust);

                scope.$watch(function() {
                    return ngModel.$modelValue;
                }, function(newValue) {
                    forceAdjust();
                });

                scope.$on('elastic:adjust', function() {
                    initMirror();
                    forceAdjust();
                });

                $timeout(adjust);

                /*
                 * destroy
                 */

                scope.$on('$destroy', function() {
                    $mirror.remove();
                    $win.unbind('resize', forceAdjust);
                });
            }
        };
    }
]);

//Deal with the Enter press into the modals
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.controller('ShowMeCtrl',['$scope','$modalInstance','message'
    , function ($scope,$modalInstance,message) {
        $scope.message = message;
        $scope.closeMe = function () {
            $modalInstance.dismiss('close');
        };

        $scope.app = {
            imageUrl: "/image/"+message
        };
        var random = (new Date()).toString();
        $scope.imageSource = $scope.app.imageUrl+'?df='+random;


    }]);
//this is to prevent typeahead /search suggestion / auto select when Enter key being pressed
app.config(["$provide", function ($provide) {
    /**
     * decorates typeahead directive so that it won't autoselect the first element.
     * This is a temporary fix until ui-bootstrap provides this functionality built-in.
     */
    $provide.decorator("typeaheadDirective", ["$delegate","$timeout",function($delegate,$timeout){

        var prevCompile = $delegate[$delegate.length -1].compile;
        $delegate[$delegate.length -1].compile = function(){
            var link = prevCompile.apply($delegate,Array.prototype.slice.call(arguments,0));

            return function(originalScope,elem,attr) {
                var result = link.apply(link,Array.prototype.slice.call(arguments,0));
                //the link creates a new child scope, we need to have access to that one.
                var scope = originalScope.$$childTail;
                var prevSelect = scope.select;

                scope.select = function(activeIdx){
                    if (activeIdx < 0) {
                        scope.matches = [];
                        elem.attr('aria-expanded', false);
                        $timeout(function() { elem[0].focus(); }, 0, false);
                    } else {
                        prevSelect.apply(scope, Array.prototype.slice.call(arguments, 0));
                    }
                };
                //we don't have access to a function that happens after getMatchesAsync
                //so we need to listen on a consequence of that function
                scope.$watchCollection("matches",function(){
                    scope.activeIdx = -1;
                });
                return result;
            }
        };
        return $delegate;
    }]);
}]);

app.controller('HomeCtrl',['$scope','$resource','$cookieStore','$http'
    ,function($scope, $resource, $cookieStore, $http) {

//TODO wraper which deals with selection box
        //creates cookie with current selection if not exists
        if($cookieStore.get('old')===undefined){
            $cookieStore.put('old',0);
        }
        $scope.choices = [
            {id:0, content:'Само новите теми',name:'New'},
            {id:1, content:'Само старите теми',name:'Old'},
            {id:2, content:'Само с нови коментари',name:'Comments'},
            {id:3, content:'Всички теми',name:'All'}
        ];
        //initial load the cookie
        $scope.selectedChoice = $scope.choices[$cookieStore.get('old')!==undefined ? $cookieStore.get('old') : 0];
        //Watches for the picked selection
        $scope.$watch('selectedChoice', function(newValue, oldValue) {
            $scope.nothing = false;
            $scope.search='';
            $cookieStore.remove('old');
            $cookieStore.put('old',newValue.id);
            pos = 0;
            $scope.products = load(pos,$scope.step,newValue.id,$scope.search);
            window.scrollTo(0, 0);
//        //get the current template url
//        var currentPageTemplate = $route.current.templateUrl;
//        //remove it from the cash
//        $templateCache.remove(currentPageTemplate);
//        //reload it again
//        $route.reload();
        });


//TODO wrapper for populating of initial variables
        $scope.showme = false;
        $scope.search = ''; //initial load w/o search
        var pos = 0; //from zero position
        $scope.step = 6; //show only five products per page
        //Initial product load
        $scope.products = load(pos,$scope.step,$scope.selectedChoice, $scope.search);
        //Products load from server
        function load(skip, limit, kind, search) {
            var res = $resource('/api');
            return res.query({s: skip ,l: limit, new: kind, search: search});
        }








//TODO wrapper for search box
        //When iten been selected from typeahead
        $scope.sel = function () {
            $scope.goSearch();
        };
        //When Enter keyboard button been pressed
        $scope.ent= function () {
            $scope.goSearch();
        };
        //typeahead controller
        $scope.goSearch = function(){
            window.scrollTo(0,0);
            $scope.nothing = false;
            $scope.search = $scope.search.trim();
            pos=0;

            $http.get('/api', {params: {s: pos, l: $scope.step,new: 3, search: $scope.search}})
                .success(function (data, status, error, config) { // .success(data,status,header,config)
                    if (data.length > 0) {

                        //TODO replace search content with name of the selected choise
                        //$scope.search = $scope.products[0].name;

                        return $scope.products = data;

                    }

                    $scope.nothing = true;
                    $scope.products='';
                })
                .error(function (err) { // .error(data,status,header,config)
                    console.log('Resource reading failed: ' + err);
                });
            var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            if (width<400) {
                $scope.search = $scope.search.substr(0, 20);
            }
        };
        //deals with the search box typeahead
        $scope.getProd = function(val) {
            if(val=='zlatozar'){$scope.showme = true;}else{$scope.showme = false;}


            return $http.post('/api/search', {
                search: val
            }).then(function(response){

                var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;

                var length = width<400 ? 30 : 55;
                var result = response.data;
                if (result !== undefined) {
                    for (i = 0; i < result.length; i++) {
                        if (result[i].length > length) {
                            result[i] = result[i].substr(0, length);
                        }
                    }
                }
                return response.data;
            });
        };
        //alerts if nothing been found after the search
        $scope.nothing = false;
        $scope.info = 'Засега няма информация за това което търсите!';


//TODO wrapper for DBclear button
        $scope.dbClear = function () {
            if (confirm('Всички снимки останали без прикачени теми ще бъдат изтрити завинаги!\nДа го направи ли???')){
                $resource('/api/clear').query();
                alert('Базата данни е почистена!!!')
            }
        };

//TODO wrapper for PREVIEW and NEXT buttons
        //Preview and Next Buttons
        $scope.prev = function(){
            if (pos >= $scope.step) {
                pos = pos - $scope.step;
                load(pos, $scope.step, $scope.selectedChoice.id,$scope.search).$promise.then(function (result) {
                    $scope.products = result;
                    window.scrollTo(0, 0);
                });
            }
        };
        $scope.next = function(){
            pos = pos + $scope.step;
            load(pos,$scope.step,$scope.selectedChoice.id,$scope.search).$promise.then(function(result){
                if (result.length === 0) {
                    pos = pos - $scope.step;
                }
                else {
                    $scope.products = result;
                    window.scrollTo(0, 0);
                }
            });
        };

//TODO wrapper for topic name length into the thumbnail
        //cut the topic name into the thumbnail if it's longer than 17 chars
        $scope.name = function (name) {
            if (name.length<=17) return name;
            return name.substr(0,17)+' ...';
        };

//TODO wrapper badges
        // Return Pros and Cons comments count
        $scope.getNumber = function(el){
            var i = 0;
            el.forEach(function(ggg){
                if (!ggg.flagIsNew){
                    i++;
                }
            });
            return i;
        };


//TODO wrapper - reloads thumb image(avoid caching)
        $scope.giveMeThumb = function (img) {
            var random = (new Date()).toString();
            $scope.app = {
                imageUrl: "/thumb/"+img
            };
            var random = (new Date()).toString();
            return $scope.app.imageUrl+'?df='+random;;
        }
    }]);


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
            if (confirm('Да завъртя ли снимката???')) {
                $scope.onoff = true;
                $resource('/rotateImage/:id', {id: $scope.Product.thumbnail}).get().$promise.then(function (product) {
                    alert('Image rotation carried out!!!\nClear the cache to view the new image');
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
                $resource('/removeImage/:id', {id: $scope.Product.thumbnail}).get().$promise.then(function (product) {
                    alert('Снимката е премахната!!!');

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
                $resource('/banImage/:id', {id: $scope.Product.thumbnail}).get().$promise.then(function (product) {
                    alert('Снимката е забранена!!!');
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
//            p.origin = product.origin;
//            p.maker = product.maker;
//            p.reseller = product.reseller;
//            p.productModel = product.productModel;
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

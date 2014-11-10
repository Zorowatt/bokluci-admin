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
})
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
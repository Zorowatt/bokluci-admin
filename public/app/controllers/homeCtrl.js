app.controller('HomeCtrl',['$scope','$resource','$cookieStore' ,function($scope, $resource, $cookieStore) {
    //creates cookie with current selection
    if($cookieStore.get('old')===undefined){
        $cookieStore.put('old',0);
    }

    var pos = 0; //from zero position
    $scope.step = 6; //show only five products per page
    $scope.choices = [
        {id:0, content:'Само новите теми',name:'New'},
        {id:1, content:'Само старите теми',name:'Old'},
        {id:2, content:'Само темите с нови коментари',name:'Comments'},
        {id:3, content:'Всички теми',name:'All'}
    ];

    $scope.selectedChoice = $scope.choices[$cookieStore.get('old')!==undefined ? $cookieStore.get('old') : 0];

    //Select which products to be shown on
    $scope.$watch('selectedChoice', function(newValue, oldValue) {
        $cookieStore.remove('old');
        $cookieStore.put('old',newValue.id);
        pos = 0;
        $scope.products = load(pos,$scope.step,newValue.id);
        window.scrollTo(0, 0);
//        //get the current template url
//        var currentPageTemplate = $route.current.templateUrl;
//        //remove it from the cash
//        $templateCache.remove(currentPageTemplate);
//        //reload it again
//        $route.reload();
    });

    //Initial product load
    $scope.products = load(pos,$scope.step,$scope.selectedChoice);
    //Products load from server
    function load(skip, limit, kind) {
        var res = $resource('/api');
        return res.query({s: skip ,l: limit, new: kind});
    }
    $scope.dbClear = function () {
        if (confirm('Всички снимки останали без прикачени теми ще бъдат изтрити завинаги!\nДа го направи ли???')){
            $resource('/api/clear').query();
            alert('Базата данни е почистена!!!')
        }
    };

    //Preview and Next Buttons
    $scope.prev = function(){
        if (pos >= $scope.step) {
            pos = pos - $scope.step;
            load(pos, $scope.step, $scope.selectedChoice.id).$promise.then(function (result) {
                $scope.products = result;
                window.scrollTo(0, 0);
            });
        }
    };
    $scope.next = function(){
        pos = pos + $scope.step;
        load(pos,$scope.step,$scope.selectedChoice.id).$promise.then(function(result){
            if (result.length === 0) {
                pos = pos - $scope.step;
            }
            else {
                $scope.products = result;
                window.scrollTo(0, 0);
            }
        });
    };

//TODO so far so good









    //New addings

//During search show message nothing been found
    $scope.nothing = false;
    $scope.info = 'Засега няма информация за това което търсите!';

//cut the topic name into the thumbnail if it's longer than 17 chars
    $scope.name = function (name) {
        if (name.length<=17) return name;
        return name.substr(0,17)+' ...';
    };
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



}]);

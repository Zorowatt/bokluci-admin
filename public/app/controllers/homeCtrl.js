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
}]);

angular.module('starter.controllers', [])

.controller('IntroCtrl', function($scope, $state) {

  //if fav location has already been selected,
  if(window.localStorage['favLocation'] != null){
    //go to dashboard immediately
    $state.go('tab.dash');
  }

  //go to select location list
  /*$scope.continue = function (){
    //continue to select fav location screen
    $state.go('selectfavlocation');
  };*/

  //go to get location screen
  $scope.continue = function (){
    //continue to select fav location screen
    $state.go('getlocation');
  };
})

.controller('GetLocationCtrl', function($scope, $http, $cordovaGeolocation, $state, $ionicViewService) {

  $scope.lat = null;
  $scope.long = null;
  $scope.resp = null;

  var retrieveClosestDevice = function(longitude, latitude){
    $http.get("http://infinite-dusk-89452.herokuapp.com/devices/nearby/" + longitude + "/" + latitude).
      then(function(response) {
        $scope.resp = response;

        window.localStorage['favLocation'] = $scope.resp.data[0]._id;
        window.localStorage['favLocationName'] = $scope.resp.data[0].name;

      }, function(response) {
        console.log("Error retrieving closest device.");
      });
  }

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    $scope.lat  = position.coords.latitude
    $scope.long = position.coords.longitude
    console.log($scope.lat + '   ' + $scope.long + ' - location retrieved!')
    retrieveClosestDevice($scope.long, $scope.lat);
  }, function(err) {
    console.log(err)
  });

  $scope.continueToDash = function (){

    //temporary - assign location into localStorage
    //store fav location id upon selection
    window.localStorage['favLocation'] = $scope.resp.data[0]._id;
    window.localStorage['favLocationName'] = $scope.resp.data[0].name;

    //clear back history stack,
    //prevent other page from coming back here upon back button press
    $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });

    //continue to select fav location screen
    $state.go('tab.dash');
  };
})

.controller('SelectFavLocationCtrl', function($scope, $state, $ionicViewService) {

  //when a location is selected
  $scope.select = function (id){
    //show selected id in console - testing purposes
    console.log(id);

    //store fav location id upon selection
    window.localStorage['favLocation'] = id;
    window.localStorage['favLocationName'] = "Cyber " + id;

    //clear back history stack,
    //prevent other page from coming back here upon back button press
    $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });

    //change screen to dashboard
    $state.go('tab.dash');
  };
})

.controller('DashCtrl', function($scope, $http, $ionicPlatform) {

  //flag for API call - success/fail
  $scope.retrieveSuccess = false;

  //initial data binding
  $scope.location = {name: window.localStorage['favLocationName'],
                      riskPercent:68,
                      riskText:"Moderate risk of mosquito breeding",
                      humidity:0,
                      temp:0,
                      pressure:0,
                      lastUpdatedTime:"-",
                      lastUpdatedDate:"-"};

  var getData = function(){
    //get latest data for location from API
    $http.get("https://infinite-dusk-89452.herokuapp.com/reports/device/" + window.localStorage['favLocation']).
      then(function(resp) {
        console.log(resp);
        $scope.location.temp = resp.data[0].temperature;
        $scope.location.humidity = resp.data[0].humidity;
        $scope.location.pressure = resp.data[0].pressure;
        //convert date string to date object
        var date = new Date(resp.data[0].createdAt);
        //extract data from date object
        $scope.location.lastUpdatedTime = date.getHours() + '' + ('0'+date.getMinutes()).slice(-2);
        $scope.location.lastUpdatedDate = date.getDate() + '/' + (date.getMonth()+1);

        //update API call flag
        $scope.retrieveSuccess = true;

        //play audio effect
        var audio = new Audio('audio/dash-loaded.wav');
        audio.play();
      }, function(resp) {
        console.log("Error retrieving data from closest device.");
      });
  };

  //retrieve data
  getData();

  $scope.refresh = function(){
    getData();
  };
})

.controller('NearbyLocationsCtrl', function($scope, Locations) {
  //return all locations
  $scope.locations = Locations.all();

  console.log('no of locations: ' + $scope.locations.length);

  $scope.playPresenceSound = function(){
    var audio = new Audio('audio/plink.wav');
    audio.play();
  };
})

.controller('SettingsCtrl', function($scope, $state, $window, $ionicHistory) {
  $scope.favLocation = {id: window.localStorage['favLocation'],
                        name: window.localStorage['favLocationName']};

  $scope.changeFavLocation = function (){
    $state.go('selectfavlocation');
  };

  $scope.clearData = function (){
    $window.localStorage.clear();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $state.go('intro');
  };
});

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

.controller('GetLocationCtrl', function($scope, $cordovaGeolocation, $state, $ionicViewService) {

  $scope.lat = null;
  $scope.long = null;

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    $scope.lat  = position.coords.latitude
    $scope.long = position.coords.longitude
    console.log($scope.lat + '   ' + $scope.long + ' - location retrieved!')
  }, function(err) {
    console.log(err)
  });

  $scope.continueToDash = function (){
    //temporary - assign location into localStorage
    //store fav location id upon selection
    window.localStorage['favLocation'] = 11;
    window.localStorage['favLocationName'] = "Cyber " + 11;

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

.controller('DashCtrl', function($scope, $ionicPlatform) {
  $scope.location = {name:"CYBER 11, CYBERJAYA",
                      riskPercent:68,
                      riskText:"Moderate risk of mosquito breeding",
                      humidity:60,
                      temp:32,
                      pressure:980,
                      lastUpdatedTime:"9:40AM",
                      lastUpdatedDate:"JUNE 12"};

  var audio = new Audio('audio/dash-loaded.wav');
  audio.play();
})

.controller('AllLocationsCtrl', function($scope, Locations) {
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

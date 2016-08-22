angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
  $scope.location = {name:"Cyber 11, Cyberjaya",
                      riskPercent:68,
                      riskText:"Moderate risk of mosquito breeding",
                      humidity:60,
                      temp:32,
                      pressure:980,
                      lastUpdatedTime:"9:40AM",
                      lastUpdatedDate:"JUNE 12"};
})

.controller('AllLocationsCtrl', function($scope, Locations) {
  //return all locations
  $scope.locations = Locations.all();
})

.controller('IntroCtrl', function($scope, $state) {

  //if fav location has already been selected,
  if(window.localStorage['favLocation'] != null){
    //go to dashboard immediately
    $state.go('tab.dash');
  }

  $scope.continue = function (){
    //continue to select fav location screen
    $state.go('selectfavlocation');
  };
})

.controller('SelectFavLocationCtrl', function($scope, $state) {

  //when a location is selected
  $scope.select = function (id){
    //show selected id in console - testing purposes
    console.log(id);

    //store fav location id upon selection
    window.localStorage['favLocation'] = id;
    window.localStorage['favLocationName'] = "Cyber " + id;

    //change screen to dashboard
    $state.go('tab.dash');
  };
})

.controller('SettingsCtrl', function($scope, $state) {
  $scope.favLocation = {id: window.localStorage['favLocation'],
                        name: window.localStorage['favLocationName']};

  $scope.changeFavLocation = function (){
    $state.go('selectfavlocation');
  };
});
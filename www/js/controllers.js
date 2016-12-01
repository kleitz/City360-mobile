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

.controller('GetLocationCtrl', function($scope, $http, $cordovaGeolocation, $state, $ionicViewService, $ionicLoading) {

  //scope variables for binding
  $scope.lat = null;
  $scope.long = null;
  $scope.resp = null;

  var setMap = function(){
    //google map config
    var latLng = new google.maps.LatLng($scope.lat, $scope.long);

    var mapOptions = {
      center: latLng,
      zoom: 9,
      disableDefaultUI: true,
      draggable: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [{"featureType":"administrative.locality","elementType":"all","stylers":[{"hue":"#2c2e33"},{"saturation":7},{"lightness":19},{"visibility":"on"}]},{"featureType":"administrative.locality","elementType":"labels.text","stylers":[{"visibility":"on"},{"saturation":"-3"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#f39247"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"poi.school","elementType":"geometry.fill","stylers":[{"color":"#f39247"},{"saturation":"0"},{"visibility":"on"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#ff6f00"},{"saturation":"100"},{"lightness":31},{"visibility":"simplified"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#f39247"},{"saturation":"0"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#008eff"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#f3dbc8"},{"saturation":"0"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2},{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8},{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":10},{"lightness":69},{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67},{"visibility":"simplified"}]}]
    };

    $scope.map = new google.maps.Map(document.getElementById("map1"), mapOptions);
  }

  //function to set marker on map
  var setMarker = function(){

      //Wait until the map is loaded
      google.maps.event.addListenerOnce($scope.map, 'idle', function(){
        //set bounds for marker
        var bounds = new google.maps.LatLngBounds();

        var markerLatLng = new google.maps.LatLng($scope.resp.data[0].loc.coordinates[1], $scope.resp.data[0].loc.coordinates[0]);
        var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: markerLatLng
        }); 
        bounds.extend(markerLatLng);

        //zoom out according to marker bounds
        $scope.map.setCenter(bounds.getCenter());
        $scope.map.setZoom(11);     
      });
      
  }

  //retrieve closest device function
  var retrieveClosestDevice = function(longitude, latitude){
    //show loading popup while data is retrieved from API
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 100,
      showDelay: 0
    });

    var req = {
       method: 'POST',
       url: 'http://city360api.herokuapp.com/v1/devices/nearby',
       headers: {
         'Content-Type': 'application/json'
       },
       data: { 
        "longitude": longitude,
        "latitude": latitude
      }
    }

    $http(req).then(function(response) {
        $scope.resp = response;

        console.log($scope.resp);

        window.localStorage['favLocation'] = $scope.resp.data[0]._id.$oid;
        window.localStorage['favLocationName'] = $scope.resp.data[0].name;

        //set map
        setMap();

        //set map marker
        setMarker();

        $ionicLoading.hide();
      }, function(response) {
        console.log("Error retrieving closest device.");
      });
  }

  var posOptions = {timeout: 20000, enableHighAccuracy: false};
  $cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    $scope.lat  = position.coords.latitude
    $scope.long = position.coords.longitude

    //store into local storage
    window.localStorage['lat'] = position.coords.latitude;
    window.localStorage['long'] = position.coords.longitude;

    //print location retrieved in console
    console.log($scope.lat + '   ' + $scope.long + ' - location retrieved!')

    //get closest devices from api
    retrieveClosestDevice($scope.long, $scope.lat);
  }, function(err) {
    console.log(err)
  });

  $scope.continueToDash = function (){

    //temporary - assign location into localStorage
    //store fav location id upon selection
    window.localStorage['favLocation'] = $scope.resp.data[0]._id.$oid;
    window.localStorage['favLocationName'] = $scope.resp.data[0].name;
    window.localStorage['favLocationLat'] = $scope.resp.data[0].loc.coordinates[0];
    window.localStorage['favLocationLong'] = $scope.resp.data[0].loc.coordinates[1];

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

.controller('DashCtrl', function($scope, $http, $ionicPlatform, $window, $ionicHistory, $state, $ionicLoading) {

  //flag for API call - success/fail
  $scope.retrieveSuccess = false;

  //initial data binding
  $scope.location = {name: window.localStorage['favLocationName'],
                      mosquitoRisk:0,
                      rainChance:"Loading..",
                      humidity:0,
                      temp:0,
                      pressure:0,
                      lastUpdatedTime:"-",
                      lastUpdatedDate:"-"};

  var getLatestReport = function(){
    //show loading popup while data is retrieved from API
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 100,
      showDelay: 0
    });

    //get latest data for location from API
    //$http.get("https://infinite-dusk-89452.herokuapp.com/reports/device/" + window.localStorage['favLocation']).
    $http.get("https://city360api.herokuapp.com/v1/devices/" + window.localStorage['favLocation']).
      then(function(resp) {
        console.log(resp);
        $scope.location.temp = resp.data.latest_report.temperature;
        $scope.location.humidity = resp.data.latest_report.humidity;
        $scope.location.pressure = resp.data.latest_report.pressure;
        $scope.location.lastUpdatedTime = resp.data.latest_report.date;
        $scope.location.rainChance = resp.data.latest_analytics.rain_chance;
        $scope.location.mosquitoRisk = resp.data.latest_analytics.mosquito_risk;

        //update API call flag
        $scope.retrieveSuccess = true;

        //hide loading popup
        $ionicLoading.hide();

        //play audio effect
        // var audio = new Audio('audio/dash-loaded.wav');
        // audio.play();
      }, function(resp) {
        //hide loading popup
        $ionicLoading.hide();
        console.log("Error retrieving data from closest device.");
      });
  };

  $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];

  $scope.labels = [];
  $scope.data = [
    [],
    []
  ];
  $scope.datasetOverride = [
    {
      label: "Temperature",
      borderWidth: 1,
      type: 'bar'
    },
    {
      label: "Humidity",
      borderWidth: 3,
      hoverBackgroundColor: "rgba(255,99,132,0.4)",
      hoverBorderColor: "rgba(255,99,132,1)",
      type: 'line'
    }
  ];

  var getLatestReportsLimited = function(){
    //get latest data for location from API
    $http.get("https://city360api.herokuapp.com/v1/reports/" + window.localStorage['favLocation'] + "/6").
      then(function(resp) {
        console.log(resp);

        for(i=0; i<resp.data.length; i++){
          //insert label (time)
          var date = new Date(resp.data[i].date);
          $scope.labels[i] = date.getHours() + ':' + ('0'+date.getMinutes()).slice(-2);
          //$scope.barData.labels[i] = date.getHours() + '' + ('0'+date.getMinutes()).slice(-2);
          //insert series (temp)
          $scope.data[0][i] = resp.data[i].temperature;
          $scope.data[1][i] = resp.data[i].humidity;
          //console.log(resp.data[i].humidity);
        }

      }, function(resp) {
        console.log("Error retrieving reports from closest device.");
      });
  };

  //retrieve latest data for dashboard
  getLatestReport();

  //retrieve data for chart
  getLatestReportsLimited();

  $scope.refresh = function(){
    getLatestReport();
    getLatestReportsLimited();
  };

  $scope.clearData = function (){
    $window.localStorage.clear();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $state.go('intro');
  };
})

.controller('NearbyLocationsCtrl', function($scope, $http, $ionicLoading, $ionicPopup) {

  //init scope variable for binding
  $scope.locations = null;
  $scope.listCanSwipe = true;

  //swipe action
  $scope.setFavourite = function (location) {
    console.log(location);

    if(location._id.$oid != window.localStorage['favLocation']){
      window.localStorage['favLocation'] = location._id.$oid;
      window.localStorage['favLocationName'] = location.name;
      window.localStorage['favLocationLat'] = location.loc.coordinates[0];
      window.localStorage['favLocationLong'] = location.loc.coordinates[1];
      
      console.log('success');
      var alertPopup = $ionicPopup.alert({
         title: 'Saved!',
         template: 'New favourite location set.'
       });
    }
    else 
    {
      // An alert dialog
      console.log("failed");
       var alertPopup = $ionicPopup.alert({
         title: 'Sorry!',
         template: 'The location is already set as your current favourite location.'
       });
    }
  };

  //function to set markers on map
  var setMap = function(){
      //google map config
      var latLng = new google.maps.LatLng(parseFloat(window.localStorage['favLocationLong']), parseFloat(window.localStorage['favLocationLat']));

      var mapOptions = {
        center: latLng,
        zoom: 7,
        disableDefaultUI: true,
        draggable: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{"featureType":"administrative.locality","elementType":"all","stylers":[{"hue":"#2c2e33"},{"saturation":7},{"lightness":19},{"visibility":"on"}]},{"featureType":"administrative.locality","elementType":"labels.text","stylers":[{"visibility":"on"},{"saturation":"-3"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#f39247"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"poi.school","elementType":"geometry.fill","stylers":[{"color":"#f39247"},{"saturation":"0"},{"visibility":"on"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#ff6f00"},{"saturation":"100"},{"lightness":31},{"visibility":"simplified"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#f39247"},{"saturation":"0"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#008eff"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#f3dbc8"},{"saturation":"0"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2},{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8},{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":10},{"lightness":69},{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67},{"visibility":"simplified"}]}]
      };

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      //Wait until the map is loaded
      google.maps.event.addListenerOnce($scope.map, 'idle', function(){
        //set bounds for marker
        var bounds = new google.maps.LatLngBounds();
        //iterate through each device
        for(var i=0; i<$scope.locations.length; i++)
        {
          var markerLatLng = new google.maps.LatLng($scope.locations[i].loc.coordinates[1], $scope.locations[i].loc.coordinates[0]);
          var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: markerLatLng
          }); 
          bounds.extend(markerLatLng);
        }
        //zoom out according to marker bounds
        $scope.map.fitBounds(bounds);
      });
  }

  //query for nearest devices with latest report data
  var req = {
       method: 'POST',
       url: 'http://city360api.herokuapp.com/v1/devices/nearby',
       headers: {
         'Content-Type': 'application/json'
       },
       data: { 
        "longitude": parseFloat(window.localStorage['long']),
        "latitude": parseFloat(window.localStorage['lat'])
      }
    }

  var getDevices = function(){
    //show loading popup while data is retrieved from API
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 100,
      showDelay: 0
    });

    $http(req).then(function(response) {
      $ionicLoading.hide();

      $scope.locations = response.data;
      console.log(response.data);

      setMap();
    }, function(response) {
      $ionicLoading.hide();
      console.log("Error retrieving closest device.");
    });
  }

  getDevices();

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

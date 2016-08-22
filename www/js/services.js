angular.module('starter.services', [])

.factory('Locations', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var locations = [{
    id: 0,
    location: 'Cyber 1',
    city: 'CYBERJAYA',
    humidity: 63,
    temp: 31,
    pressure: 960
  }, {
    id: 1,
    location: 'Cyber 2',
    city: 'CYBERJAYA',
    humidity: 68,
    temp: 32,
    pressure: 960
  }, {
    id: 2,
    location: 'Cyber 3',
    city: 'CYBERJAYA',
    humidity: 72,
    temp: 34,
    pressure: 980
  }, {
    id: 3,
    location: 'Cyber 4',
    city: 'CYBERJAYA',
    humidity: 73,
    temp: 35,
    pressure: 990
  }];

  return {
    all: function() {
      return locations;
    },
    get: function(locationId) {
      for (var i = 0; i < locations.length; i++) {
        if (locations[i].id === parseInt(locationId)) {
          return locations[i];
        }
      }
      return null;
    }
  };
});

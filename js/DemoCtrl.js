(function () {
  'use strict';

  var myApp = angular.module('MyApp', ['ngMaterial']);
  myApp.controller('DemoCtrl', DemoCtrl);

  function DemoCtrl ($timeout, $q, $log, $scope, $http, $templateCache, $compile) {
    var self = this;

    var map;

    $scope.site = {};

    self.simulateQuery = false;
    self.isDisabled    = false;

    // list of `state` value/display objects
    self.states        = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;

    // ******************************
    // Internal methods
    // ******************************

    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {

      var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }

    function searchTextChange(text) {
      $log.info('Text changed to ' + text);
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));

      var center = map.getCenter();
      $scope.method = 'GET';
      // $scope.url = 'http://map.naver.com/search2/local.nhn?sm=hty&searchCoord='+ center.F + ';'+ center.A +'&isFirstSearch=true&query=' + item.value;
      $scope.url = '/pangyo.json';
    }

    $scope.fetch = function() {
      $scope.code = null;
      $scope.response = null;

      $http({method: $scope.method, url: $scope.url, cache: $templateCache
      }).success(function(data, status) {
          $scope.status = status;
          $scope.data = data;

          console.log($scope.data);
          data.result.site.list.forEach(function(element, index) {
            $scope.site = element;

            var image = {
              url: 'http://static.naver.net/maps/img/icons/sp_pins_spot_v3.png',
              size: new google.maps.Size(29, 37),
              origin: new google.maps.Point((element.rank-1)*29, 4*37),
              anchor: new google.maps.Point(0, 37)
            };
            var marker = new google.maps.Marker({
              map: map,
              position: new google.maps.LatLng(element.y, element.x),
              title: element.name,
              icon: image
            });

            var scope = $scope;
            scope.$watch('site', function(newValue, oldValue) {
                $scope.site = newValue;
            });

            google.maps.event.addListener(marker, 'click', function() {
              var contentString = '<div class="infoWindow"><img src="'
                + element.thumUrl
                + '" style="float: left; width: 15%; padding-right: 10px"><h1>'
                + element.name + '</h1><p>' + element.roadAddress + ' / <a href="tel://'+ element.tel +'">'+ element.tel +'</a>' + '</p></div>';
              var infowindow = new google.maps.InfoWindow({
                  content: contentString
              });

              infowindow.open(map,marker);
              $scope.site = element;

              if (element.rank == 9) {
                $http.get('/instagram.seasonstable.json').success(function(data, status) {
                  console.log(data);
                  data.data.forEach(function(element, index) {
                    // debugger;
                    if (element.type == 'image') {
                      var a = document.createElement("A");
                      a.href = element.link;
                      var img = document.createElement("IMG");
                      img.src = element.images.thumbnail.url;
                      img.width = element.images.thumbnail.width;
                      img.height = element.images.thumbnail.height;
                      a.appendChild(img);
                      $('#detail md-card-content #images').append(a);
                    }

                    element.likes.data.forEach(function(like, index) {
                      var a = document.createElement("A");
                      a.href = 'https://instagram.com/' + like.username;
                      var img = document.createElement("IMG");
                      img.src = like.profile_picture;
                      img.width = 30;
                      img.height = 30;
                      a.appendChild(img);
                      $('#detail md-card-content #likes').append(a);
                    });
                  });
                  $('#detail md-card-content #likes').append('+' + $('#likes a').length);
                });
              }

              scope.$digest();
            });

          });

      }).error(function(data, status) {
          $scope.data = data || "Request failed";
          $scope.status = status;
      });
    };

    $scope.detail = function(element) {
      $scope.site = element;
      var scope = $scope;
      $compile($('#detail').contents())(scope);
      console.log('detail', element);
    }

    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
      var allStates = '판교 맛집';

      return allStates.split(/, +/g).map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }

    $scope.date = new Date().getHours();

    function initialize() {
      var mapOptions = {
        center: new google.maps.LatLng(37.4014699, 127.1043242),
        zoom: 15
      };
      var mapCanvas = document.getElementById('map-canvas');
      var height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

      mapCanvas.style.height = height - ($('#hours').height() + $('.autocompletedemoBasicUsage').height()) + "px";
      map = new google.maps.Map(mapCanvas, mapOptions);

      // var marker = new google.maps.Marker({
      //   map: map,
      //   anchorPoint: new google.maps.Point(0, -29)
      // });
      // google.maps.event.addListener(marker, 'click', function() {
      //   infowindow.open(map,marker);
      // });

    }

    google.maps.event.addDomListener(window, 'load', initialize);
  }

})();

'use strict'; 
angular.module('PopupApp', ['windowsPopup', 'ngRoute'])

  .config(function ($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'sampleOne.html'
      })
      .when('/sampleOne', {
        templateUrl: 'sampleOne.html'
      })
     .when('/sampleTwo', {
        templateUrl: 'sampleTwo.html'
      })
     .when('/sampleThree', {
        templateUrl: 'sampleThree.html'
      })
     .when('/sampleFour', {
        templateUrl: 'sampleFour.html'
      })
     .when('/sampleFive', {
        templateUrl: 'sampleFive.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  })

.controller('childCtrl', function($scope, wnpToChild) {

});

